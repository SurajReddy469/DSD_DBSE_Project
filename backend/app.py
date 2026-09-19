import os, json, math, secrets
from datetime import date, datetime, timedelta, timezone
from functools import wraps
from flask import make_response
from pathlib import Path

import jwt
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import or_, func
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__)
app.config['ENV_MODE'] = os.getenv('APP_ENV', 'development')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-only-change-me')
if app.config['ENV_MODE'] == 'production' and app.config['SECRET_KEY'] == 'dev-only-change-me':
    raise RuntimeError('SECRET_KEY must be configured in production')
db_url = os.getenv('DATABASE_URL', f"sqlite:///{BASE_DIR / 'library.db'}")
# SQLAlchemy 2.x accepts mysql+pymysql URLs for production MySQL 8 deployments.
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 280,
    'pool_size': int(os.getenv('DB_POOL_SIZE', '10')),
    'max_overflow': int(os.getenv('DB_MAX_OVERFLOW', '20')),
}

db = SQLAlchemy(app)
migrate = Migrate(app, db, compare_type=True)
CORS(app, resources={r'/api/*': {'origins': os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')}})

class LoginAttempt(db.Model):
    __tablename__ = 'login_attempts'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    identifier = db.Column(db.String(255), nullable=False, index=True)
    failed_count = db.Column(db.Integer, default=0, nullable=False)
    locked_until = db.Column(db.DateTime(timezone=True))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class RefreshToken(db.Model):
    __tablename__ = 'refresh_tokens'
    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.String(64), nullable=False, index=True)
    token_hash = db.Column(db.String(128), nullable=False, unique=True, index=True)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    revoked = db.Column(db.Boolean, default=False, nullable=False)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(64), primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')
    student_id = db.Column(db.String(80), unique=True, index=True)
    library_card_id = db.Column(db.String(80), unique=True, index=True)
    campus = db.Column(db.String(120), nullable=False, default='Bachupally')
    program = db.Column(db.String(160))
    section = db.Column(db.String(80))
    department = db.Column(db.String(255))
    year = db.Column(db.String(120))
    phone = db.Column(db.String(80))
    avatar = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default='active')
    membership_date = db.Column(db.String(20), nullable=False)
    notification_preferences = db.Column(db.Text, default='{}')

    def to_dict(self):
        borrowed = Loan.query.filter_by(user_id=self.id).filter(Loan.status != 'returned').count()
        fines = db.session.query(func.coalesce(func.sum(Fine.amount), 0)).filter_by(user_id=self.id, status='unpaid').scalar() or 0
        return {'id': self.id, 'name': self.name, 'email': self.email, 'role': self.role,
                'studentId': self.student_id, 'libraryCardId': self.library_card_id, 'campus': self.campus, 'program': self.program, 'section': self.section, 'department': self.department, 'year': self.year,
                'phone': self.phone, 'avatar': self.avatar, 'status': self.status,
                'membershipDate': self.membership_date, 'borrowedCount': borrowed,
                'finesOwed': round(float(fines), 2),
                'notificationPreferences': json.loads(self.notification_preferences or '{}')}

class Book(db.Model):
    __tablename__ = 'books'
    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(300), nullable=False, index=True)
    author = db.Column(db.Text, nullable=False, index=True)
    isbn = db.Column(db.String(80), nullable=False, unique=True, index=True)
    publisher = db.Column(db.String(255))
    publication_year = db.Column(db.Integer)
    category = db.Column(db.String(160), index=True)
    rating = db.Column(db.Float, default=0)
    review_count = db.Column(db.Integer, default=0)
    description = db.Column(db.Text)
    total_copies = db.Column(db.Integer, default=0)
    available_copies = db.Column(db.Integer, default=0)
    shelf_location = db.Column(db.String(160))
    cover_url = db.Column(db.Text)
    language = db.Column(db.String(80))
    status = db.Column(db.String(30), default='available')
    tags_json = db.Column(db.Text, default='[]')
    ddc_class = db.Column(db.String(40))
    edition = db.Column(db.String(120))
    floor = db.Column(db.String(80))
    rack = db.Column(db.String(80))
    section = db.Column(db.String(120))

    def to_dict(self, include_reviews=True):
        d = {'id': self.id, 'title': self.title, 'author': self.author, 'isbn': self.isbn,
             'publisher': self.publisher, 'publicationYear': self.publication_year, 'category': self.category,
             'rating': self.rating, 'reviewCount': self.review_count, 'description': self.description,
             'totalCopies': self.total_copies, 'availableCopies': self.available_copies,
             'shelfLocation': self.shelf_location, 'coverUrl': self.cover_url, 'language': self.language,
             'status': self.status, 'tags': json.loads(self.tags_json or '[]'), 'ddcClass': self.ddc_class, 'edition': self.edition, 'floor': self.floor, 'rack': self.rack, 'section': self.section}
        if include_reviews:
            d['reviews'] = [r.to_dict() for r in Review.query.filter_by(book_id=self.id).order_by(Review.date.desc()).all()]
        return d

class BookCopy(db.Model):
    __tablename__ = 'book_copies'
    id = db.Column(db.String(64), primary_key=True)
    book_id = db.Column(db.String(64), db.ForeignKey('books.id'), nullable=False, index=True)
    barcode = db.Column(db.String(100), unique=True, nullable=False, index=True)
    accession_number = db.Column(db.String(100), unique=True, nullable=False)
    status = db.Column(db.String(30), nullable=False, default='available')
    condition = db.Column(db.String(30), default='good')
    acquired_date = db.Column(db.String(20))
    location = db.Column(db.String(160))

    def to_dict(self):
        return {'id': self.id, 'bookId': self.book_id, 'barcode': self.barcode, 'accessionNumber': self.accession_number,
                'status': self.status, 'condition': self.condition, 'acquiredDate': self.acquired_date, 'location': self.location}

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.String(64), primary_key=True)
    book_id = db.Column(db.String(64), db.ForeignKey('books.id'), nullable=False)
    user_name = db.Column(db.String(160), nullable=False)
    user_avatar = db.Column(db.Text)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    date = db.Column(db.String(30), nullable=False)
    def to_dict(self):
        return {'id': self.id, 'bookId': self.book_id, 'userName': self.user_name, 'userAvatar': self.user_avatar,
                'rating': self.rating, 'comment': self.comment, 'date': self.date}

class Loan(db.Model):
    __tablename__ = 'loans'
    id = db.Column(db.String(64), primary_key=True)
    book_id = db.Column(db.String(64), db.ForeignKey('books.id'), nullable=False, index=True)
    book_title = db.Column(db.String(300), nullable=False)
    book_cover = db.Column(db.Text)
    book_author = db.Column(db.Text)
    user_id = db.Column(db.String(64), db.ForeignKey('users.id'), nullable=False, index=True)
    user_name = db.Column(db.String(160), nullable=False)
    student_id = db.Column(db.String(80))
    issue_date = db.Column(db.String(20), nullable=False)
    due_date = db.Column(db.String(20), nullable=False)
    return_date = db.Column(db.String(20))
    status = db.Column(db.String(30), nullable=False, default='active')
    renewal_count = db.Column(db.Integer, default=0)
    fine_amount = db.Column(db.Float, default=0)
    copy_id = db.Column(db.String(64), db.ForeignKey('book_copies.id'))
    def to_dict(self):
        return {'id': self.id, 'bookId': self.book_id, 'bookTitle': self.book_title, 'bookCover': self.book_cover,
                'bookAuthor': self.book_author, 'userId': self.user_id, 'userName': self.user_name,
                'studentId': self.student_id, 'issueDate': self.issue_date, 'dueDate': self.due_date,
                'returnDate': self.return_date, 'status': self.status, 'renewalCount': self.renewal_count,
                'fineAmount': round(self.fine_amount or 0, 2), 'copyId': self.copy_id}

class Reservation(db.Model):
    __tablename__ = 'reservations'
    id = db.Column(db.String(64), primary_key=True)
    book_id = db.Column(db.String(64), nullable=False, index=True)
    book_title = db.Column(db.String(300), nullable=False)
    book_cover = db.Column(db.Text)
    user_id = db.Column(db.String(64), nullable=False, index=True)
    user_name = db.Column(db.String(160), nullable=False)
    student_id = db.Column(db.String(80))
    reservation_date = db.Column(db.String(20), nullable=False)
    expiry_date = db.Column(db.String(20), nullable=False)
    queue_position = db.Column(db.Integer, default=1)
    status = db.Column(db.String(30), default='active')
    def to_dict(self):
        return {'id': self.id, 'bookId': self.book_id, 'bookTitle': self.book_title, 'bookCover': self.book_cover,
                'userId': self.user_id, 'userName': self.user_name, 'studentId': self.student_id,
                'reservationDate': self.reservation_date, 'expiryDate': self.expiry_date,
                'queuePosition': self.queue_position, 'status': self.status}

class Fine(db.Model):
    __tablename__ = 'fines'
    id = db.Column(db.String(64), primary_key=True)
    loan_id = db.Column(db.String(64), nullable=False)
    book_id = db.Column(db.String(64), nullable=False)
    book_title = db.Column(db.String(300), nullable=False)
    user_id = db.Column(db.String(64), nullable=False, index=True)
    user_name = db.Column(db.String(160), nullable=False)
    due_date = db.Column(db.String(20), nullable=False)
    return_date = db.Column(db.String(20))
    days_overdue = db.Column(db.Integer, default=0)
    amount = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='unpaid')
    paid_date = db.Column(db.String(20))
    payment_method = db.Column(db.String(100))
    def to_dict(self):
        return {'id': self.id, 'loanId': self.loan_id, 'bookId': self.book_id, 'bookTitle': self.book_title,
                'userId': self.user_id, 'userName': self.user_name, 'dueDate': self.due_date,
                'returnDate': self.return_date, 'daysOverdue': self.days_overdue, 'amount': round(self.amount, 2),
                'status': self.status, 'paidDate': self.paid_date, 'paymentMethod': self.payment_method}

class PasswordReset(db.Model):
    __tablename__ = 'password_resets'
    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.String(64), db.ForeignKey('users.id'), nullable=False, index=True)
    token = db.Column(db.String(128), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    used = db.Column(db.Boolean, default=False, nullable=False)

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.String(64), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(40), nullable=False)
    date = db.Column(db.String(40), nullable=False)
    read = db.Column(db.Boolean, default=False)
    link = db.Column(db.String(255))
    def to_dict(self):
        return {'id': self.id, 'userId': self.user_id, 'title': self.title, 'message': self.message,
                'type': self.type, 'date': self.date, 'read': self.read, 'link': self.link}

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.String(64), primary_key=True)
    name = db.Column(db.String(160), nullable=False, unique=True)
    slug = db.Column(db.String(180), nullable=False, unique=True)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')
    def to_dict(self):
        count = Book.query.filter_by(category=self.name).count()
        return {'id': self.id, 'name': self.name, 'slug': self.slug, 'description': self.description,
                'bookCount': count, 'status': self.status}

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.String(64), nullable=False)
    user_name = db.Column(db.String(160), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    action = db.Column(db.String(100), nullable=False, index=True)
    resource = db.Column(db.Text)
    resource_id = db.Column(db.String(64))
    timestamp = db.Column(db.String(30), nullable=False)
    ip_address = db.Column(db.String(64))
    status = db.Column(db.String(20), default='success')
    def to_dict(self):
        return {'id': self.id, 'userId': self.user_id, 'userName': self.user_name, 'role': self.role,
                'action': self.action, 'resource': self.resource, 'resourceId': self.resource_id,
                'timestamp': self.timestamp, 'ipAddress': self.ip_address, 'status': self.status}

class SystemSetting(db.Model):
    __tablename__ = 'system_settings'
    id = db.Column(db.Integer, primary_key=True, default=1)
    library_name = db.Column(db.String(255), default='KLH Bachupally Campus Library')
    institution_name = db.Column(db.String(255), default='Koneru Lakshmaiah Education Foundation (KLH University) - Bachupally Campus')
    contact_email = db.Column(db.String(255), default='librarian@klh.edu.in')
    contact_phone = db.Column(db.String(100), default='+91 7815926816')
    max_loan_duration_days = db.Column(db.Integer, default=14)
    max_renewals = db.Column(db.Integer, default=2)
    fine_rate_per_day = db.Column(db.Float, default=2.0)
    max_loans_student = db.Column(db.Integer, default=4)
    max_loans_faculty = db.Column(db.Integer, default=10)
    campus_address = db.Column(db.String(500), default='Bachupally-Gandimaisamma Road, Bowrampet, Hyderabad, Telangana - 500043')
    enable_email_notifications = db.Column(db.Boolean, default=True)
    enable_auto_overdue_fines = db.Column(db.Boolean, default=True)
    maintenance_mode = db.Column(db.Boolean, default=False)
    def to_dict(self):
        return {'libraryName': self.library_name, 'institutionName': self.institution_name,
                'contactEmail': self.contact_email, 'contactPhone': self.contact_phone,
                'maxLoanDurationDays': self.max_loan_duration_days, 'maxRenewals': self.max_renewals,
                'fineRatePerDay': self.fine_rate_per_day, 'maxLoansStudent': self.max_loans_student,
                'maxLoansFaculty': self.max_loans_faculty, 'enableEmailNotifications': self.enable_email_notifications,
                'enableAutoOverdueFines': self.enable_auto_overdue_fines, 'maintenanceMode': self.maintenance_mode}

def now_iso(): return datetime.now(timezone.utc).isoformat()
def today(): return date.today()
def new_id(prefix): return f'{prefix}-{int(datetime.now().timestamp()*1000)}'

def create_notification_once(user_id, title, message, ntype, link=None, key=None):
    key = key or f'{title}|{message}'
    existing = Notification.query.filter_by(user_id=user_id, title=title, type=ntype).all()
    if any(key in (n.message or '') for n in existing):
        return None
    n = Notification(id=new_id('nt'), user_id=user_id, title=title, message=message, type=ntype, date=now_iso(), read=False, link=link)
    db.session.add(n)
    return n

def process_notification_automation():
    # Idempotent daily due-soon, overdue, reservation-expiry and fine alerts.
    settings = SystemSetting.query.first() or SystemSetting()
    today_d = today()
    created = 0
    for loan in Loan.query.filter(Loan.status != 'returned').all():
        try: due = date.fromisoformat(loan.due_date)
        except Exception: continue
        days = (due - today_d).days
        if days == 2:
            n=create_notification_once(loan.user_id, 'Book Due in 2 Days', f'"{loan.book_title}" is due on {loan.due_date}. Please return or renew it from your KLH Library portal.', 'due_reminder', '/student/borrowed-books', f'loan:{loan.id}:due2:{today_d}')
            created += bool(n)
        if days < 0:
            amount=max(0, -days * float(settings.fine_rate_per_day or 0))
            if settings.enable_auto_overdue_fines:
                loan.status='overdue'; loan.fine_amount=amount
                n=create_notification_once(loan.user_id, 'Overdue Library Book', f'"{loan.book_title}" is {abs(days)} day(s) overdue. Current estimated fine: ₹{amount:.2f}.', 'overdue', '/student/borrowed-books', f'loan:{loan.id}:overdue:{today_d}')
                created += bool(n)
    for r in Reservation.query.filter(Reservation.status=='ready').all():
        try: expiry=date.fromisoformat(r.expiry_date)
        except Exception: continue
        if expiry < today_d:
            r.status='cancelled'
            active=Reservation.query.filter_by(book_id=r.book_id,status='active').order_by(Reservation.reservation_date,Reservation.id).all()
            for i,x in enumerate(active,1): x.queue_position=i
            n=create_notification_once(r.user_id, 'Reservation Expired', f'Your reservation for "{r.book_title}" expired because the pickup window ended.', 'announcement', '/student/reservations', f'res:{r.id}:expired')
            created += bool(n)
    db.session.commit()
    return created

def token_for(user, hours=1):
    payload = {'sub': user.id, 'role': user.role, 'type': 'access', 'exp': datetime.now(timezone.utc) + timedelta(hours=hours)}
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def refresh_token_for(user):
    raw = secrets.token_urlsafe(48)
    import hashlib
    db.session.add(RefreshToken(id=new_id('rt'), user_id=user.id, token_hash=hashlib.sha256(raw.encode()).hexdigest(),
                                expires_at=datetime.now(timezone.utc) + timedelta(days=7)))
    return raw

def auth_response(user):
    access = token_for(user)
    return {'accessToken': access, 'refreshToken': refresh_token_for(user), 'token': access, 'user': user.to_dict()}

def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '): return jsonify(error='Authentication required'), 401
        try:
            payload = jwt.decode(header[7:], app.config['SECRET_KEY'], algorithms=['HS256'])
            user = db.session.get(User, payload['sub'])
            if not user or user.status != 'active': return jsonify(error='Account is inactive or suspended'), 403
            g.user = user
        except jwt.PyJWTError:
            return jsonify(error='Invalid or expired token'), 401
        return fn(*args, **kwargs)
    return wrapper

def roles(*allowed):
    def decorator(fn):
        @wraps(fn)
        @auth_required
        def wrapper(*args, **kwargs):
            if g.user.role not in allowed: return jsonify(error='Insufficient permissions'), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def audit(action, resource, resource_id='', status='success'):
    u = getattr(g, 'user', None)
    if not u: return
    db.session.add(AuditLog(id=new_id('log'), user_id=u.id, user_name=u.name, role=u.role,
                            action=action, resource=resource, resource_id=resource_id,
                            timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                            ip_address=request.remote_addr or '127.0.0.1', status=status))

def seed_if_empty():
    """Seed a fresh KLH demo database from the bundled JSON fixtures."""
    if User.query.first():
        return
    def load(name):
        path = BASE_DIR / name
        return json.loads(path.read_text(encoding='utf-8')) if path.exists() else []

    settings = SystemSetting(library_name='KLH Bachupally Campus Library',
        institution_name='Koneru Lakshmaiah Education Foundation (KLH University) - Bachupally Campus',
        contact_email='librarian@klh.edu.in', contact_phone='+91 7815926816',
        campus_address='Bachupally-Gandimaisamma Road, Bowrampet, Hyderabad, Telangana - 500043',
        max_loan_duration_days=14, max_renewals=2, fine_rate_per_day=2.0,
        max_loans_student=4, max_loans_faculty=10)
    db.session.add(settings)

    for x in load('mockUsers.json'):
        email=x.get('email','').replace('@alexandria.edu','@klh.edu.in')
        db.session.add(User(id=x['id'], name=x['name'], email=email,
            password_hash=generate_password_hash('password'), role=x.get('role','student'),
            student_id=x.get('studentId'), library_card_id=x.get('libraryCardId') or f"KLH-BP-{x.get('studentId','STUDENT').replace(' ','').upper()}", campus=x.get('campus','Bachupally'), program=x.get('program'), section=x.get('section'), department=x.get('department'), year=x.get('year'),
            phone=x.get('phone'), avatar=x.get('avatar'), status=x.get('status','active'),
            membership_date=x.get('membershipDate', today().isoformat())))

    for x in load('mockCategories.json'):
        db.session.add(Category(id=x['id'], name=x['name'], slug=x.get('slug',x['name'].lower().replace(' ','-')),
            description=x.get('description',''), status=x.get('status','active')))

    for x in load('mockBooks.json'):
        b=Book(id=x['id'], title=x['title'], author=x['author'], isbn=x['isbn'], publisher=x.get('publisher'),
            publication_year=x.get('publicationYear'), category=x.get('category'), rating=x.get('rating',0),
            review_count=x.get('reviewCount',0), description=x.get('description',''), total_copies=x.get('totalCopies',0),
            available_copies=x.get('availableCopies',0), shelf_location=x.get('shelfLocation'), cover_url=x.get('coverUrl'),
            language=x.get('language','English'), status=x.get('status','available'), tags_json=json.dumps(x.get('tags',[])),
            ddc_class={'Computer Science & AI':'000-099','Computer Science':'000-099','Engineering':'600-699','Management':'650-659'}.get(x.get('category'),'500-599'),
            edition='Demo academic edition', floor='First Floor', rack=x.get('shelfLocation','').split(',')[0] if x.get('shelfLocation') else 'General',
            section=x.get('category','General'))
        db.session.add(b)
        for i in range(max(int(x.get('totalCopies',0)),0)):
            available=i < int(x.get('availableCopies',0))
            db.session.add(BookCopy(id=f"copy-{x['id']}-{i+1}", book_id=x['id'], barcode=f"KLH-{x['id'].upper()}-{i+1:03d}",
                accession_number=f"ACC-{x['id'].upper()}-{i+1:03d}", status='available' if available else 'issued',
                condition='good', acquired_date=today().isoformat(), location=x.get('shelfLocation') or 'Central Library'))
        for r in x.get('reviews',[]):
            db.session.add(Review(id=r['id'],book_id=x['id'],user_name=r.get('userName','KLH Student'),user_avatar=r.get('userAvatar'),rating=r.get('rating',5),comment=r.get('comment',''),date=r.get('date',today().isoformat())))

    db.session.commit()
    # Preserve demo operational history after users/books exist.
    for x in load('mockLoans.json'):
        db.session.add(Loan(id=x['id'], book_id=x['bookId'], book_title=x['bookTitle'], book_cover=x.get('bookCover'), book_author=x.get('bookAuthor'),
            user_id=x['userId'], user_name=x['userName'], student_id=x.get('studentId'), issue_date=x['issueDate'], due_date=x['dueDate'],
            return_date=x.get('returnDate'), status=x.get('status','active'), renewal_count=x.get('renewalCount',0), fine_amount=x.get('fineAmount',0)))
    # Assign seeded active loans to physical copies so circulation data is consistent.
    for loan in Loan.query.filter(Loan.status != 'returned').order_by(Loan.issue_date, Loan.id).all():
        if not loan.copy_id:
            used = {x.copy_id for x in Loan.query.filter(Loan.status != 'returned', Loan.copy_id.isnot(None)).all()}
            c = BookCopy.query.filter(BookCopy.book_id == loan.book_id, BookCopy.status == 'issued', ~BookCopy.id.in_(used or ['__none__'])).order_by(BookCopy.id).first()
            if c:
                loan.copy_id = c.id

    for x in load('mockReservations.json'):
        db.session.add(Reservation(id=x['id'],book_id=x['bookId'],book_title=x['bookTitle'],book_cover=x.get('bookCover'),user_id=x['userId'],user_name=x['userName'],student_id=x.get('studentId'),reservation_date=x['reservationDate'],expiry_date=x['expiryDate'],queue_position=x.get('queuePosition',1),status=x.get('status','active')))
    for x in load('mockFines.json'):
        db.session.add(Fine(id=x['id'],loan_id=x['loanId'],book_id=x['bookId'],book_title=x['bookTitle'],user_id=x['userId'],user_name=x['userName'],due_date=x['dueDate'],return_date=x.get('returnDate'),days_overdue=x.get('daysOverdue',0),amount=x.get('amount',0),status=x.get('status','unpaid'),paid_date=x.get('paidDate'),payment_method=x.get('paymentMethod')))
    for x in load('mockNotifications.json'):
        db.session.add(Notification(id=x['id'],user_id=x['userId'],title=x['title'],message=x['message'],type=x['type'],date=x['date'],read=x.get('read',False),link=x.get('link')))
    for x in load('mockAuditLogs.json'):
        db.session.add(AuditLog(id=x['id'],user_id=x['userId'],user_name=x['userName'],role=x['role'],action=x['action'],resource=x.get('resource',''),resource_id=x.get('resourceId'),timestamp=x['timestamp'],ip_address=x.get('ipAddress'),status=x.get('status','success')))
    db.session.commit()
    print('KLH demo database seeded successfully.')

@app.get('/api/copies/lookup')
@roles('librarian','admin')
def lookup_copy():
    code=(request.args.get('code') or '').strip()
    if not code:
        return jsonify(error='Barcode or accession number is required'),400
    c=BookCopy.query.filter(or_(BookCopy.barcode==code, BookCopy.accession_number==code)).first()
    if not c:
        return jsonify(error='Copy not found'),404
    b=db.session.get(Book,c.book_id)
    return jsonify(copy=c.to_dict(), book=b.to_dict(False) if b else None)

@app.get('/api/books/<book_id>/copies/summary')
@roles('librarian','admin')
def copy_summary(book_id):
    b=db.session.get(Book,book_id)
    if not b:return jsonify(error='Book not found'),404
    copies=BookCopy.query.filter_by(book_id=book_id).all()
    return jsonify(bookId=book_id,total=len(copies),available=sum(c.status=='available' for c in copies),issued=sum(c.status=='issued' for c in copies),lost=sum(c.status=='lost' for c in copies),damaged=sum(c.status=='damaged' for c in copies),copies=[c.to_dict() for c in copies])

@app.post('/api/copies/<copy_id>/status')
@roles('librarian','admin')
def update_copy_status(copy_id):
    c=db.session.get(BookCopy,copy_id)
    if not c:return jsonify(error='Copy not found'),404
    new_status=(request.get_json() or {}).get('status')
    if new_status not in ('available','issued','lost','damaged','maintenance'):
        return jsonify(error='Invalid copy status'),400
    if new_status=='available' and Loan.query.filter_by(copy_id=copy_id,status='active').first():
        return jsonify(error='Cannot mark an actively issued copy as available'),409
    c.status=new_status
    b=db.session.get(Book,c.book_id)
    if b:
        b.total_copies=BookCopy.query.filter_by(book_id=b.id).count()
        b.available_copies=BookCopy.query.filter_by(book_id=b.id,status='available').count()
        b.status='out_of_stock' if b.available_copies==0 else ('low_stock' if b.available_copies<=2 else 'available')
    audit('COPY_STATUS_CHANGED',f'Copy {c.barcode} changed to {new_status}',c.id,'warning' if new_status in ('lost','damaged') else 'success')
    db.session.commit()
    return jsonify(c.to_dict())

@app.get('/api/dashboard/analytics')
@roles('librarian','admin')
def dashboard_analytics():
    books=Book.query.all()
    loans=Loan.query.all()
    for l in loans: refresh_loan_status(l)
    db.session.commit()
    category_counts=db.session.query(Book.category,func.count(Book.id)).group_by(Book.category).order_by(func.count(Book.id).desc()).all()
    popular=db.session.query(Loan.book_id,Loan.book_title,func.count(Loan.id).label('borrow_count')).group_by(Loan.book_id,Loan.book_title).order_by(func.count(Loan.id).desc()).limit(10).all()
    overdue=Loan.query.filter(Loan.status=='overdue').count()
    return jsonify(
        totalTitles=len(books), totalCopies=sum(b.total_copies or 0 for b in books), availableCopies=sum(b.available_copies or 0 for b in books),
        activeLoans=Loan.query.filter(Loan.status!='returned').count(), overdueLoans=overdue,
        reservations=Reservation.query.filter(Reservation.status.in_(['active','ready'])).count(), outstandingFines=round(sum((f.amount or 0) for f in Fine.query.filter_by(status='unpaid').all()),2),
        members=User.query.filter_by(role='student').count(), categories=[{'name':k or 'Uncategorized','count':v} for k,v in category_counts],
        popularBooks=[{'bookId':bid,'title':title,'borrowCount':count} for bid,title,count in popular]
    )

@app.get('/api/health')
def health(): return jsonify(status='ok', service='library-management-api', version='1.0', environment=app.config['ENV_MODE'])

def valid_university_email(email):
    return email.endswith('@klh.edu.in') or email.endswith('@kluniversity.in')

def password_valid(password):
    return len(password) >= 8 and any(c.isalpha() for c in password) and any(c.isdigit() for c in password)

@app.post('/api/auth/login')
def login():
    data=request.get_json() or {}; identifier=(data.get('identifier') or data.get('email') or '').strip(); password=data.get('password') or ''
    key=identifier.lower()
    attempt=LoginAttempt.query.filter_by(identifier=key).first()
    now=datetime.now(timezone.utc)
    if attempt and attempt.locked_until and attempt.locked_until > now:
        return jsonify(error='Too many failed attempts. Try again later.'), 429
    user=User.query.filter(or_(func.lower(User.email)==key, func.lower(User.student_id)==key)).first()
    if not user or not check_password_hash(user.password_hash,password):
        if not attempt: attempt=LoginAttempt(identifier=key)
        attempt.failed_count += 1; attempt.updated_at=now
        if attempt.failed_count >= 5:
            attempt.locked_until=now+timedelta(minutes=15); attempt.failed_count=0
        db.session.add(attempt); db.session.commit()
        return jsonify(error='Invalid university ID/email or password'), 401
    if user.status != 'active': return jsonify(error='Account is suspended or inactive'), 403
    if attempt:
        attempt.failed_count=0; attempt.locked_until=None; attempt.updated_at=now
    result=auth_response(user); db.session.commit()
    return jsonify(result)

@app.post('/api/auth/refresh')
def refresh_auth():
    data=request.get_json() or {}; raw=data.get('refreshToken') or ''
    import hashlib
    row=RefreshToken.query.filter_by(token_hash=hashlib.sha256(raw.encode()).hexdigest(), revoked=False).first()
    if not row or row.expires_at < datetime.now(timezone.utc): return jsonify(error='Refresh token is invalid or expired'),401
    user=db.session.get(User,row.user_id)
    if not user or user.status!='active': return jsonify(error='Account is inactive or suspended'),403
    row.revoked=True
    result=auth_response(user); db.session.commit()
    return jsonify(result)

@app.post('/api/auth/logout')
@auth_required
def logout():
    data=request.get_json() or {}; raw=data.get('refreshToken') or ''
    if raw:
        import hashlib
        row=RefreshToken.query.filter_by(token_hash=hashlib.sha256(raw.encode()).hexdigest(), user_id=g.user.id, revoked=False).first()
        if row: row.revoked=True
    db.session.commit(); return jsonify(message='Logged out successfully')

@app.post('/api/auth/register')
def register():
    data=request.get_json() or {}; email=(data.get('email') or '').strip().lower(); password=data.get('password') or ''; student_id=(data.get('studentId') or '').strip()
    if not email or not password or not data.get('name') or not student_id: return jsonify(error='name, university ID, email and password are required'),400
    if not valid_university_email(email): return jsonify(error='Use a KLH university email ending in @klh.edu.in or @kluniversity.in'),400
    if not password_valid(password): return jsonify(error='Password must be at least 8 characters and include letters and numbers'),400
    if User.query.filter(func.lower(User.email)==email).first(): return jsonify(error='Email already registered'),409
    if User.query.filter(func.lower(User.student_id)==student_id.lower()).first(): return jsonify(error='University ID already registered'),409
    user=User(id=new_id('usr-student'), name=data['name'], email=email, password_hash=generate_password_hash(password), role='student',
              student_id=student_id, library_card_id=f"KLH-BP-{student_id.upper()}", campus='Bachupally', program=data.get('program'), section=data.get('section'), department=data.get('department'), year=data.get('year'), phone=data.get('phone'),
              status='active', membership_date=today().isoformat(), avatar=data.get('avatar'))
    db.session.add(user); db.session.flush(); result=auth_response(user); db.session.commit(); return jsonify(result),201

@app.post('/api/auth/forgot-password')
def forgot_password():
    data=request.get_json() or {}; email=(data.get('email') or '').strip().lower()
    user=User.query.filter(func.lower(User.email)==email).first()
    # Avoid revealing whether an account exists. In demo mode the token is returned for local testing.
    if user:
        PasswordReset.query.filter_by(user_id=user.id, used=False).update({'used': True})
        raw=secrets.token_urlsafe(32)
        reset=PasswordReset(id=new_id('reset'), user_id=user.id, token=raw, expires_at=datetime.now(timezone.utc)+timedelta(minutes=30))
        db.session.add(reset); db.session.commit()
        return jsonify(message='If the account exists, reset instructions have been created.', demoToken=raw)
    return jsonify(message='If the account exists, reset instructions have been created.')

@app.post('/api/auth/reset-password')
def reset_password():
    data=request.get_json() or {}; token=data.get('token') or ''; password=data.get('password') or ''
    if not password_valid(password): return jsonify(error='Password must be at least 8 characters and include letters and numbers'),400
    reset=PasswordReset.query.filter_by(token=token, used=False).first()
    if not reset or reset.expires_at < datetime.now(timezone.utc): return jsonify(error='Reset token is invalid or expired'),400
    user=db.session.get(User, reset.user_id)
    if not user: return jsonify(error='Account not found'),404
    user.password_hash=generate_password_hash(password); reset.used=True; db.session.commit()
    return jsonify(message='Password updated successfully')

@app.post('/api/auth/change-password')
@auth_required
def change_password():
    data=request.get_json() or {}; current=data.get('currentPassword') or ''; new=data.get('newPassword') or ''
    if not check_password_hash(g.user.password_hash,current): return jsonify(error='Current password is incorrect'),400
    if not password_valid(new): return jsonify(error='Password must be at least 8 characters and include letters and numbers'),400
    g.user.password_hash=generate_password_hash(new)
    RefreshToken.query.filter_by(user_id=g.user.id, revoked=False).update({'revoked': True})
    audit('PASSWORD_CHANGED','Authentication',g.user.id); db.session.commit()
    return jsonify(message='Password changed successfully')

@app.get('/api/auth/me')
@auth_required
def me(): return jsonify(g.user.to_dict())

@app.get('/api/members/me/library-card')
@auth_required
def my_library_card():
    u=g.user
    loans=Loan.query.filter(Loan.user_id==u.id, Loan.status!='returned').all()
    fines=Fine.query.filter_by(user_id=u.id, status='unpaid').all()
    limit=SystemSetting.query.first()
    max_loans=(limit.max_loans_faculty if u.role=='librarian' else limit.max_loans_student) if limit else 4
    return jsonify({**u.to_dict(), 'libraryCardId': u.library_card_id or f'KLH-BP-{u.student_id or u.id}'.upper(), 'campus':u.campus or 'Bachupally', 'program':u.program, 'section':u.section, 'borrowLimit':max_loans, 'remainingBorrowSlots':max(0,max_loans-len(loans)), 'outstandingFine':round(sum(float(f.amount or 0) for f in fines),2), 'libraryStatus':'Active' if u.status=='active' else 'Inactive'})

@app.get('/api/books/<book_id>/copies')
@roles('librarian','admin')
def get_book_copies(book_id):
    if not db.session.get(Book, book_id): return jsonify(error='Book not found'), 404
    return jsonify([c.to_dict() for c in BookCopy.query.filter_by(book_id=book_id).order_by(BookCopy.accession_number).all()])

@app.post('/api/books/<book_id>/copies')
@roles('librarian','admin')
def add_book_copy(book_id):
    if not db.session.get(Book, book_id): return jsonify(error='Book not found'), 404
    d=request.get_json() or {}
    barcode=d.get('barcode') or f"KLH-{book_id.upper()}-{BookCopy.query.filter_by(book_id=book_id).count()+1:03d}"
    if BookCopy.query.filter((BookCopy.barcode==barcode)|(BookCopy.accession_number==d.get('accessionNumber'))).first(): return jsonify(error='Barcode or accession number already exists'),409
    c=BookCopy(id=new_id('copy'),book_id=book_id,barcode=barcode,accession_number=d.get('accessionNumber') or f"ACC-{book_id.upper()}-{BookCopy.query.filter_by(book_id=book_id).count()+1:03d}",condition=d.get('condition','good'),acquired_date=d.get('acquiredDate',today().isoformat()),location=d.get('location','Central Library'),status='available')
    b=db.session.get(Book,book_id); b.total_copies+=1; b.available_copies+=1; b.status='available'
    db.session.add(c); audit('COPY_ADDED',f'Copy added for {b.title}',c.id); db.session.commit(); return jsonify(c.to_dict()),201

@app.get('/api/books')
def get_books():
    q=Book.query
    search=request.args.get('search','').strip(); category=request.args.get('category'); author=request.args.get('author')
    availability=request.args.get('availability','all'); min_rating=float(request.args.get('minRating',0) or 0); year=request.args.get('year')
    if search: q=q.filter(or_(Book.title.ilike(f'%{search}%'), Book.author.ilike(f'%{search}%'), Book.isbn.ilike(f'%{search}%'), Book.category.ilike(f'%{search}%')))
    if category and category!='all': q=q.filter_by(category=category)
    if author and author!='all': q=q.filter(Book.author.ilike(f'%{author}%'))
    if min_rating: q=q.filter(Book.rating>=min_rating)
    if year and year!='all':
        try: q=q.filter(Book.publication_year>=int(year))
        except ValueError: pass
    if availability=='available': q=q.filter(Book.available_copies>0)
    elif availability=='out_of_stock': q=q.filter(Book.available_copies==0)
    elif availability=='low_stock': q=q.filter(Book.available_copies.between(1,2))
    sort=request.args.get('sortBy','title'); order=request.args.get('sortOrder','asc'); mapping={'title':Book.title,'rating':Book.rating,'year':Book.publication_year,'availableCopies':Book.available_copies}
    col=mapping.get(sort,Book.title); q=q.order_by(col.desc() if order=='desc' else col.asc())
    total=q.count(); page=max(int(request.args.get('page',1)),1); limit=max(min(int(request.args.get('limit',8)),100),1); items=q.offset((page-1)*limit).limit(limit).all()
    return jsonify(books=[b.to_dict(False) for b in items], total=total, page=page, totalPages=max(math.ceil(total/limit),1))

@app.get('/api/books/<book_id>')
def get_book(book_id):
    b=db.session.get(Book,book_id); return (jsonify(b.to_dict()),200) if b else (jsonify(error='Book not found'),404)

@app.get('/api/books/featured')
def featured():
    limit=int(request.args.get('limit',4)); return jsonify([b.to_dict(False) for b in Book.query.order_by(Book.rating.desc()).limit(limit).all()])

@app.get('/api/books/similar')
def similar():
    category=request.args.get('category'); current=request.args.get('currentBookId'); limit=int(request.args.get('limit',3))
    return jsonify([b.to_dict(False) for b in Book.query.filter(Book.category==category, Book.id!=current).limit(limit).all()])

@app.post('/api/books')
@roles('librarian','admin')
def create_book():
    d=request.get_json() or {}; b=Book(id=new_id('bk'), title=d['title'], author=d['author'], isbn=d['isbn'], publisher=d.get('publisher'), publication_year=d.get('publicationYear'), category=d.get('category'), rating=4.5, review_count=0, description=d.get('description',''), total_copies=d.get('totalCopies',0), available_copies=d.get('availableCopies',d.get('totalCopies',0)), shelf_location=d.get('shelfLocation'), cover_url=d.get('coverUrl'), language=d.get('language','English'), status=d.get('status','available'), tags_json=json.dumps(d.get('tags') or [d.get('category','General')]))
    db.session.add(b); audit('BOOK_ADDED',f'Book: {b.title}',b.id); db.session.commit(); return jsonify(b.to_dict()),201

@app.patch('/api/books/<book_id>')
@roles('librarian','admin')
def update_book(book_id):
    b=db.session.get(Book,book_id)
    if not b: return jsonify(error='Book not found'),404
    d=request.get_json() or {}; fields={'title':'title','author':'author','isbn':'isbn','publisher':'publisher','publicationYear':'publication_year','category':'category','description':'description','totalCopies':'total_copies','availableCopies':'available_copies','shelfLocation':'shelf_location','coverUrl':'cover_url','language':'language','status':'status'}
    for k,v in d.items():
        if k in fields: setattr(b,fields[k],v)
    if 'tags' in d: b.tags_json=json.dumps(d['tags'])
    audit('BOOK_UPDATED',f'Book: {b.title}',b.id); db.session.commit(); return jsonify(b.to_dict())

@app.delete('/api/books/<book_id>')
@roles('librarian','admin')
def delete_book(book_id):
    b=db.session.get(Book,book_id)
    if not b: return jsonify(error='Book not found'),404
    audit('BOOK_DELETED',f'Book: {b.title}',b.id,'warning'); db.session.delete(b); db.session.commit(); return jsonify(success=True)

@app.get('/api/categories')
def categories(): return jsonify([c.to_dict() for c in Category.query.order_by(Category.name).all()])

@app.post('/api/categories')
@roles('admin')
def create_category():
    d=request.get_json() or {}; name=(d.get('name') or '').strip()
    if not name: return jsonify(error='Category name is required'),400
    if Category.query.filter(func.lower(Category.name)==name.lower()).first(): return jsonify(error='Category already exists'),409
    slug=(d.get('slug') or name.lower()).strip().replace(' ','-')
    c=Category(id=new_id('cat'),name=name,slug=slug,description=d.get('description',''),status=d.get('status','active'))
    db.session.add(c); audit('CATEGORY_CREATED',f'Category: {name}',c.id); db.session.commit(); return jsonify(c.to_dict()),201

@app.patch('/api/categories/<category_id>')
@roles('admin')
def update_category(category_id):
    c=db.session.get(Category,category_id)
    if not c:return jsonify(error='Category not found'),404
    d=request.get_json() or {}; old=c.name
    if 'name' in d:c.name=d['name'].strip()
    if 'description' in d:c.description=d['description']
    if 'status' in d:c.status=d['status']
    c.slug=(d.get('slug') or c.name.lower()).replace(' ','-')
    audit('CATEGORY_UPDATED',f'Category: {old} -> {c.name}',c.id); db.session.commit(); return jsonify(c.to_dict())

@app.delete('/api/categories/<category_id>')
@roles('admin')
def delete_category(category_id):
    c=db.session.get(Category,category_id)
    if not c:return jsonify(error='Category not found'),404
    if Book.query.filter_by(category=c.name).count():return jsonify(error='Cannot delete a category that still contains books'),400
    audit('CATEGORY_DELETED',f'Category: {c.name}',c.id,'warning'); db.session.delete(c); db.session.commit(); return jsonify(success=True)

@app.get('/api/users')
@roles('librarian','admin')
def users():
    role=request.args.get('role'); q=User.query
    if role: q=q.filter_by(role=role)
    return jsonify([u.to_dict() for u in q.order_by(User.name).all()])

@app.get('/api/users/<user_id>')
@auth_required
def user_by_id(user_id):
    if g.user.id!=user_id and g.user.role not in ('librarian','admin'): return jsonify(error='Forbidden'),403
    u=db.session.get(User,user_id); return (jsonify(u.to_dict()),200) if u else (jsonify(error='User not found'),404)

@app.post('/api/users')
@roles('admin')
def create_user():
    d=request.get_json() or {}; email=d['email'].lower()
    if User.query.filter_by(email=email).first(): return jsonify(error='Email already exists'),409
    u=User(id=new_id('usr'),name=d['name'],email=email,password_hash=generate_password_hash(d.get('password','password')),role=d.get('role','student'),student_id=d.get('studentId'),department=d.get('department'),year=d.get('year'),phone=d.get('phone'),avatar=d.get('avatar'),status=d.get('status','active'),membership_date=d.get('membershipDate',today().isoformat()))
    db.session.add(u); audit('USER_CREATED',f'Created account for {u.name} ({u.role})',u.id); db.session.commit(); return jsonify(u.to_dict()),201

@app.patch('/api/users/<user_id>')
@auth_required
def update_user(user_id):
    if g.user.id!=user_id and g.user.role not in ('librarian','admin'): return jsonify(error='Forbidden'),403
    u=db.session.get(User,user_id)
    if not u:return jsonify(error='User not found'),404
    d=request.get_json() or {}; mapping={'name':'name','email':'email','studentId':'student_id','department':'department','year':'year','phone':'phone','avatar':'avatar','status':'status'}
    if g.user.role not in ('admin','librarian'): d={k:v for k,v in d.items() if k in ('name','phone','avatar','department','year')}
    for k,v in d.items():
        if k in mapping:setattr(u,mapping[k],v)
    db.session.commit(); return jsonify(u.to_dict())

@app.post('/api/users/<user_id>/toggle-status')
@roles('admin','librarian')
def toggle_user(user_id):
    u=db.session.get(User,user_id)
    if not u:return jsonify(error='User not found'),404
    u.status='suspended' if u.status=='active' else 'active'; audit('USER_SUSPENDED' if u.status=='suspended' else 'USER_ACTIVATED',f'User status changed to {u.status} for {u.name}',u.id,'warning' if u.status=='suspended' else 'success'); db.session.commit(); return jsonify(u.to_dict())

@app.get('/api/circulation/card/<code>')
@roles('librarian','admin')
def circulation_card(code):
    code=(code or '').strip()
    u=User.query.filter(or_(User.library_card_id==code, User.student_id==code, User.email.ilike(code))).first()
    if not u:
        return jsonify(error='Library card or student ID not found'),404
    if u.status!='active':
        return jsonify(error=f'Account is {u.status} and cannot use circulation services', user=u.to_dict()),403
    active=Loan.query.filter(Loan.user_id==u.id, Loan.status!='returned').order_by(Loan.due_date.asc()).all()
    for l in active: refresh_loan_status(l)
    db.session.commit()
    settings=SystemSetting.query.first()
    limit=settings.max_loans_student if u.role=='student' else settings.max_loans_faculty if settings else 10
    return jsonify(user=u.to_dict(), borrowLimit=limit, activeLoans=[l.to_dict() for l in active], outstandingFine=round(sum(float(f.amount or 0) for f in Fine.query.filter_by(user_id=u.id,status='unpaid').all()),2))

@app.get('/api/circulation/book/<code>')
@roles('librarian','admin')
def circulation_book(code):
    code=(code or '').strip()
    c=BookCopy.query.filter(or_(BookCopy.barcode==code, BookCopy.accession_number==code)).first()
    if not c:
        return jsonify(error='Barcode or accession number not found'),404
    b=db.session.get(Book,c.book_id)
    active=Loan.query.filter_by(copy_id=c.id).filter(Loan.status!='returned').first()
    return jsonify(copy=c.to_dict(), book=b.to_dict(False) if b else None, activeLoan=active.to_dict() if active else None)

@app.post('/api/circulation/scan')
@roles('librarian','admin')
def circulation_scan():
    d=request.get_json() or {}; action=(d.get('action') or '').lower(); card=(d.get('cardCode') or '').strip(); barcode=(d.get('bookCode') or '').strip()
    if action not in ('issue','return'):
        return jsonify(error='Action must be issue or return'),400
    u=User.query.filter(or_(User.library_card_id==card, User.student_id==card, User.email.ilike(card))).first()
    if not u:return jsonify(error='Library card or student ID not found'),404
    if u.status!='active':return jsonify(error=f'Account is {u.status}'),403
    c=BookCopy.query.filter(or_(BookCopy.barcode==barcode,BookCopy.accession_number==barcode)).first()
    if not c:return jsonify(error='Book barcode or accession number not found'),404
    b=db.session.get(Book,c.book_id)
    if not b:return jsonify(error='Book not found'),404
    if action=='issue':
        if c.status!='available':return jsonify(error=f'Copy is {c.status}'),400
        try:
            settings=SystemSetting.query.first() or SystemSetting()
            due=(today()+timedelta(days=settings.max_loan_duration_days or 14)).isoformat()
            l=issue_loan(b,u,due,c); audit('RFID_BARCODE_ISSUE',f'Copy {c.barcode} issued to {u.name}',l.id); db.session.commit()
            return jsonify(message=f'Issued {b.title} to {u.name}',action=action,loan=l.to_dict(),user=u.to_dict(),copy=c.to_dict(),book=b.to_dict(False)),201
        except ValueError as e:return jsonify(error=str(e)),400
    loan=Loan.query.filter_by(copy_id=c.id).filter(Loan.status!='returned').first()
    if not loan:return jsonify(error='This copy has no active loan'),400
    if loan.user_id!=u.id:return jsonify(error='Scanned student does not match the current borrower'),403
    loan.return_date=today().isoformat(); loan.status='returned'; c.status='available'; b.available_copies=min(b.total_copies,b.available_copies+1)
    b.status='available' if b.available_copies>2 else ('low_stock' if b.available_copies>0 else 'out_of_stock')
    settings=SystemSetting.query.first(); rate=settings.fine_rate_per_day if settings else .5; days=max((today()-date.fromisoformat(loan.due_date)).days,0); fine=None
    if days>0:
        amount=round(days*rate,2); fine=Fine(id=new_id('fn'),loan_id=loan.id,book_id=loan.book_id,book_title=loan.book_title,user_id=loan.user_id,user_name=loan.user_name,due_date=loan.due_date,return_date=loan.return_date,days_overdue=days,amount=amount,status='unpaid'); loan.fine_amount=amount; db.session.add(fine)
    db.session.add(Notification(id=new_id('nt'),user_id=u.id,title='Book Return Confirmed',message=f'"{b.title}" was returned via the circulation desk.',type='book_returned',date=now_iso(),read=False,link='/student/history'))
    audit('RFID_BARCODE_RETURN',f'Copy {c.barcode} returned by {u.name}',loan.id); db.session.commit()
    return jsonify(message=f'Returned {b.title} from {u.name}',action=action,loan=loan.to_dict(),fine=fine.to_dict() if fine else None,user=u.to_dict(),copy=c.to_dict(),book=b.to_dict(False))

@app.get('/api/loans')
@auth_required
def get_loans():
    uid=request.args.get('userId')
    if g.user.role=='student': uid=g.user.id
    q=Loan.query
    if uid:q=q.filter_by(user_id=uid)
    items=q.order_by(Loan.issue_date.desc()).all()
    for x in items: refresh_loan_status(x)
    db.session.commit()
    return jsonify([x.to_dict() for x in items])

@app.get('/api/loans/active')
@auth_required
def active_loans():
    uid=g.user.id if g.user.role=='student' else request.args.get('userId'); q=Loan.query.filter(Loan.status!='returned')
    if uid:q=q.filter_by(user_id=uid)
    items=q.order_by(Loan.due_date.asc()).all()
    for x in items: refresh_loan_status(x)
    db.session.commit()
    return jsonify([x.to_dict() for x in items])

@app.get('/api/loans/history')
@auth_required
def loan_history():
    uid=g.user.id if g.user.role=='student' else request.args.get('userId'); q=Loan.query.filter_by(status='returned')
    if uid:q=q.filter_by(user_id=uid)
    return jsonify([x.to_dict() for x in q.order_by(Loan.return_date.desc()).all()])

def refresh_loan_status(loan):
    if loan.status == 'returned':
        return loan
    try:
        due = date.fromisoformat(loan.due_date)
        days = (today() - due).days
        if days > 0:
            loan.status = 'overdue'
        elif days >= -2:
            loan.status = 'due_soon'
        else:
            loan.status = 'active'
    except (TypeError, ValueError):
        loan.status = 'active'
    return loan

def available_copy_for(book):
    return BookCopy.query.filter_by(book_id=book.id, status='available').order_by(BookCopy.accession_number).first()

def validate_borrowing_limit(user):
    settings = SystemSetting.query.first() or SystemSetting()
    limit = settings.max_loans_faculty if user.role in ('faculty','librarian') else settings.max_loans_student
    active_count = Loan.query.filter_by(user_id=user.id).filter(Loan.status != 'returned').count()
    if active_count >= limit:
        raise ValueError(f'Borrowing limit reached ({limit} active books)')
    return limit

def overdue_fine_for(loan):
    settings = SystemSetting.query.first() or SystemSetting()
    try:
        days = max((today() - date.fromisoformat(loan.due_date)).days, 0)
    except (TypeError, ValueError):
        days = 0
    return days, round(days * (settings.fine_rate_per_day or 0), 2)

def issue_loan(book,user,due,copy=None):
    if book.available_copies <= 0:
        raise ValueError('No available copies to borrow')
    validate_borrowing_limit(user)
    selected_copy = copy or available_copy_for(book)
    if not selected_copy:
        raise ValueError('No physical copy is available for this title')
    selected_copy.status = 'issued'
    book.available_copies = max(book.available_copies - 1, 0)
    book.status = 'out_of_stock' if book.available_copies == 0 else ('low_stock' if book.available_copies <= 2 else 'available')
    l=Loan(id=new_id('ln'),book_id=book.id,book_title=book.title,book_cover=book.cover_url,book_author=book.author,
           user_id=user.id,user_name=user.name,student_id=user.student_id,issue_date=today().isoformat(),due_date=due,
           status='active',renewal_count=0,fine_amount=0,copy_id=selected_copy.id)
    db.session.add(l)
    db.session.add(Notification(id=new_id('nt'),user_id=user.id,title='Book Borrowed Successfully',
        message=f'You borrowed "{book.title}". Copy {selected_copy.barcode}. Due date is {due}.',
        type='book_borrowed',date=now_iso(),read=False,link='/student/borrowed'))
    return l

@app.post('/api/loans/borrow')
@auth_required
def borrow():
    d=request.get_json() or {}; uid=g.user.id if g.user.role=='student' else d.get('userId'); user=db.session.get(User,uid); book=db.session.get(Book,d.get('bookId'))
    if not user or not book:return jsonify(error='Book or user not found'),404
    if user.status!='active':return jsonify(error='Account is suspended due to unpaid fines or policy violation'),403
    try:
        due=(today()+timedelta(days=(SystemSetting.query.first() or SystemSetting()).max_loan_duration_days or 14)).isoformat(); l=issue_loan(book,user,due); audit('BOOK_BORROWED',f'Book: {book.title}',book.id); db.session.commit(); return jsonify(l.to_dict()),201
    except ValueError as e:return jsonify(error=str(e)),400

@app.post('/api/loans/issue')
@roles('librarian','admin')
def issue_direct():
    d=request.get_json() or {}; book=db.session.get(Book,d.get('bookId')); user=db.session.get(User,d.get('userId'))
    if not book or not user:return jsonify(error='Book or member not found'),404
    try:l=issue_loan(book,user,d.get('dueDate') or (today()+timedelta(days=(SystemSetting.query.first() or SystemSetting()).max_loan_duration_days or 14)).isoformat()); audit('BOOK_ISSUED',f'Issued "{book.title}" to {user.name}',l.id); db.session.commit(); return jsonify(l.to_dict()),201
    except ValueError as e:return jsonify(error=str(e)),400

@app.post('/api/loans/<loan_id>/renew')
@auth_required
def renew(loan_id):
    l=db.session.get(Loan,loan_id)
    if not l:return jsonify(error='Loan record not found'),404
    if g.user.role=='student' and l.user_id!=g.user.id:return jsonify(error='Forbidden'),403
    if l.status=='returned':return jsonify(error='Cannot renew a returned book'),400
    settings=SystemSetting.query.first(); maxr=settings.max_renewals if settings else 2
    if l.renewal_count>=maxr:return jsonify(error=f'Maximum renewals ({maxr}) reached for this loan'),400
    l.due_date=(date.fromisoformat(l.due_date)+timedelta(days=(settings.max_loan_duration_days if settings else 14))).isoformat(); l.renewal_count+=1; l.status='active'; audit('LOAN_RENEWED',f'Loan: {l.book_title} (New Due Date: {l.due_date})',l.id); db.session.commit(); return jsonify(l.to_dict())

@app.post('/api/loans/<loan_id>/return')
@roles('librarian','admin')
def return_loan(loan_id):
    l=db.session.get(Loan,loan_id)
    if not l:return jsonify(error='Loan not found'),404
    if l.status=='returned':return jsonify(error='Loan already returned'),400
    l.return_date=today().isoformat(); l.status='returned'; b=db.session.get(Book,l.book_id)
    if b:
        b.available_copies=min(b.total_copies,b.available_copies+1);
        if l.copy_id:
            c=db.session.get(BookCopy,l.copy_id)
            if c:c.status='available'
        b.status='available' if b.available_copies>2 else ('low_stock' if b.available_copies>0 else 'out_of_stock')
    settings=SystemSetting.query.first(); rate=settings.fine_rate_per_day if settings else .5; days=max((today()-date.fromisoformat(l.due_date)).days,0); fine=None
    if days>0:
        amount=round(days*rate,2); fine=Fine(id=new_id('fn'),loan_id=l.id,book_id=l.book_id,book_title=l.book_title,user_id=l.user_id,user_name=l.user_name,due_date=l.due_date,return_date=l.return_date,days_overdue=days,amount=amount,status='unpaid'); l.fine_amount=amount; db.session.add(fine)
    next_res = Reservation.query.filter_by(book_id=l.book_id, status='active').order_by(Reservation.queue_position.asc(), Reservation.reservation_date.asc()).first()
    if next_res:
        next_res.status = 'ready'
        next_res.expiry_date = (today() + timedelta(days=3)).isoformat()
        db.session.add(Notification(id=new_id('nt'), user_id=next_res.user_id, title='Reserved Book Ready',
            message=f'"{next_res.book_title}" is now ready for pickup. Please collect it within 3 days.',
            type='reservation_ready', date=now_iso(), read=False, link='/student/reservations'))
    db.session.add(Notification(id=new_id('nt'),user_id=l.user_id,title='Book Return Confirmed',message=f'"{l.book_title}" was successfully returned on {l.return_date}.',type='book_returned',date=now_iso(),read=False,link='/student/history'))
    audit('BOOK_RETURNED',f'Loan: {l.book_title} returned by {l.user_name}',l.id); db.session.commit(); return jsonify(loan=l.to_dict(),fine=fine.to_dict() if fine else None)

@app.get('/api/reservations')
@auth_required
def reservations():
    uid=g.user.id if g.user.role=='student' else request.args.get('userId'); q=Reservation.query
    if uid:q=q.filter_by(user_id=uid)
    return jsonify([r.to_dict() for r in q.order_by(Reservation.reservation_date.desc()).all()])

@app.post('/api/reservations')
@auth_required
def reserve():
    d=request.get_json() or {}; uid=g.user.id if g.user.role=='student' else d.get('userId'); b=db.session.get(Book,d.get('bookId')); u=db.session.get(User,uid)
    if not b or not u:return jsonify(error='Book or user not found'),404
    if Reservation.query.filter(Reservation.book_id==b.id,Reservation.user_id==u.id,Reservation.status.in_(['active','ready'])).first():return jsonify(error='You already have an active hold / reservation for this title'),400
    pos=Reservation.query.filter_by(book_id=b.id,status='active').count()+1; r=Reservation(id=new_id('res'),book_id=b.id,book_title=b.title,book_cover=b.cover_url,user_id=u.id,user_name=u.name,student_id=u.student_id,reservation_date=today().isoformat(),expiry_date=(today()+timedelta(days=14)).isoformat(),queue_position=pos,status='active'); db.session.add(r); db.session.add(Notification(id=new_id('nt'),user_id=u.id,title='Reservation Confirmed',message=f'Reservation confirmed for "{b.title}". Your queue position is #{pos}.',type='reservation_ready',date=now_iso(),read=False,link='/student/reservations')); audit('RESERVATION_CREATED',f'Reserved "{b.title}" (Queue #{pos})',r.id); db.session.commit(); return jsonify(r.to_dict()),201

@app.post('/api/reservations/<res_id>/cancel')
@auth_required
def cancel_res(res_id):
    r=db.session.get(Reservation,res_id)
    if not r:return jsonify(error='Reservation not found'),404
    if g.user.role=='student' and r.user_id!=g.user.id:return jsonify(error='Forbidden'),403
    r.status='cancelled'; active=Reservation.query.filter_by(book_id=r.book_id,status='active').order_by(Reservation.reservation_date,Reservation.id).all()
    for i,x in enumerate(active,1):x.queue_position=i
    audit('RESERVATION_CANCELLED',f'Cancelled reservation for "{r.book_title}"',r.id,'warning'); db.session.commit(); return jsonify(success=True)

@app.post('/api/reservations/<res_id>/ready')
@roles('librarian','admin')
def ready_res(res_id):
    r=db.session.get(Reservation,res_id)
    if not r:return jsonify(error='Reservation not found'),404
    r.status='ready'; db.session.add(Notification(id=new_id('nt'),user_id=r.user_id,title='Book Ready for Pickup!',message=f'Your reserved copy of "{r.book_title}" is now held at the circulation desk.',type='reservation_ready',date=now_iso(),read=False,link='/student/reservations')); db.session.commit(); return jsonify(r.to_dict())

@app.get('/api/fines')
@auth_required
def fines():
    uid=g.user.id if g.user.role=='student' else request.args.get('userId'); q=Fine.query
    if uid:q=q.filter_by(user_id=uid)
    return jsonify([f.to_dict() for f in q.order_by(Fine.due_date.desc()).all()])

@app.get('/api/fines/stats')
@auth_required
def fine_stats():
    uid=g.user.id if g.user.role=='student' else request.args.get('userId'); q=Fine.query
    if uid:q=q.filter_by(user_id=uid)
    fs=q.all(); return jsonify(totalOutstanding=round(sum(f.amount for f in fs if f.status=='unpaid'),2),totalPaid=round(sum(f.amount for f in fs if f.status=='paid'),2),unpaidCount=sum(f.status=='unpaid' for f in fs))

@app.post('/api/fines/<fine_id>/pay')
@auth_required
def pay_fine(fine_id):
    f=db.session.get(Fine,fine_id)
    if not f:return jsonify(error='Fine record not found'),404
    if g.user.role=='student' and f.user_id!=g.user.id:return jsonify(error='Forbidden'),403
    if f.status=='paid':return jsonify(error='Fine is already paid'),400
    f.status='paid'; f.paid_date=today().isoformat(); f.payment_method=(request.get_json() or {}).get('paymentMethod','Campus Card (Mock Pay)')
    db.session.add(Notification(id=new_id('nt'),user_id=f.user_id,title='Fine Payment Receipt',message=f'Successfully processed payment of ₹{f.amount:.2f} for "{f.book_title}".',type='book_returned',date=now_iso(),read=False,link='/student/fines')); audit('FINE_PAID',f'Payment of ₹{f.amount:.2f} for "{f.book_title}" via {f.payment_method}',f.id); db.session.commit(); return jsonify(f.to_dict())

@app.get('/api/notifications/preferences')
@auth_required
def get_notification_preferences():
    defaults={'dueReminders':True,'reservationAlerts':True,'overdueAlerts':True,'recommendationAlerts':True,'emailEnabled':True}
    try: defaults.update(json.loads(g.user.notification_preferences or '{}'))
    except Exception: pass
    return jsonify(defaults)

@app.patch('/api/notifications/preferences')
@auth_required
def update_notification_preferences():
    d=request.get_json() or {}
    allowed={'dueReminders','reservationAlerts','overdueAlerts','recommendationAlerts','emailEnabled'}
    prefs={k:bool(v) for k,v in d.items() if k in allowed}
    current={}
    try: current=json.loads(g.user.notification_preferences or '{}')
    except Exception: pass
    current.update(prefs); g.user.notification_preferences=json.dumps(current)
    db.session.commit()
    return jsonify(current)

@app.post('/api/notifications/process')
@roles('librarian','admin')
def process_notifications():
    created=process_notification_automation()
    audit('NOTIFICATIONS_PROCESSED',f'Automation created {created} notification(s)','notification-engine')
    db.session.commit()
    return jsonify(success=True, created=created, processedAt=now_iso())

@app.get('/api/notifications')
@auth_required
def notifications(): return jsonify([n.to_dict() for n in Notification.query.filter_by(user_id=g.user.id).order_by(Notification.date.desc()).all()])

@app.post('/api/notifications/<notification_id>/read')
@auth_required
def mark_read(notification_id):
    n=db.session.get(Notification,notification_id)
    if not n or n.user_id!=g.user.id:return jsonify(error='Notification not found'),404
    n.read=True; db.session.commit(); return jsonify(n.to_dict())

@app.post('/api/notifications/read-all')
@auth_required
def read_all(): Notification.query.filter_by(user_id=g.user.id,read=False).update({'read':True}); db.session.commit(); return jsonify(success=True)

@app.get('/api/audit-logs')
@roles('admin')
def audit_logs():
    action=request.args.get('action'); q=AuditLog.query
    if action and action!='all':q=q.filter_by(action=action)
    return jsonify([x.to_dict() for x in q.order_by(AuditLog.timestamp.desc()).all()])

@app.get('/api/settings')
@roles('admin')
def get_settings(): return jsonify((SystemSetting.query.first() or SystemSetting()).to_dict())

@app.patch('/api/settings')
@roles('admin')
def update_settings():
    s=SystemSetting.query.first()
    if not s:s=SystemSetting();db.session.add(s)
    d=request.get_json() or {}; mapping={'libraryName':'library_name','institutionName':'institution_name','contactEmail':'contact_email','contactPhone':'contact_phone','maxLoanDurationDays':'max_loan_duration_days','maxRenewals':'max_renewals','fineRatePerDay':'fine_rate_per_day','maxLoansStudent':'max_loans_student','maxLoansFaculty':'max_loans_faculty','campusAddress':'campus_address','enableEmailNotifications':'enable_email_notifications','enableAutoOverdueFines':'enable_auto_overdue_fines','maintenanceMode':'maintenance_mode'}
    for k,v in d.items():
        if k in mapping:setattr(s,mapping[k],v)
    audit('SETTINGS_MODIFIED','System configuration parameters updated','sys-config'); db.session.commit(); return jsonify(s.to_dict())

@app.get('/api/student/insights')
@roles('student')
def student_insights():
    uid=g.user.id
    all_loans=Loan.query.filter_by(user_id=uid).order_by(Loan.issue_date.desc()).all()
    completed=[l for l in all_loans if l.status=='returned' or l.return_date]
    active=[l for l in all_loans if l.status!='returned']
    category_counts={}
    for loan in all_loans:
        b=db.session.get(Book, loan.book_id)
        if b and b.category:
            category_counts[b.category]=category_counts.get(b.category,0)+1
    preferred=sorted(category_counts.items(), key=lambda x:(-x[1],x[0]))
    monthly={}
    for loan in all_loans:
        month=(loan.issue_date or '')[:7]
        if month: monthly[month]=monthly.get(month,0)+1
    months=sorted(monthly.keys())[-6:]
    activity=[{'label':m,'value':monthly[m]} for m in months]
    return jsonify(totalLoans=len(all_loans),completedLoans=len(completed),activeLoans=len(active),preferredCategories=[{'name':k,'count':v} for k,v in preferred[:5]],monthlyActivity=activity)

@app.get('/api/books/recommended')
@roles('student')
def recommended_books():
    uid=g.user.id; limit=max(min(int(request.args.get('limit',6)),12),1)
    loans=Loan.query.filter_by(user_id=uid).order_by(Loan.issue_date.desc()).limit(30).all()
    categories=[]
    for loan in loans:
        b=db.session.get(Book,loan.book_id)
        if b and b.category and b.category not in categories: categories.append(b.category)
    candidates=[]
    if categories:
        q=Book.query.filter(Book.category.in_(categories), Book.id.notin_([l.book_id for l in loans])).order_by(Book.rating.desc(),Book.review_count.desc())
        candidates=q.limit(limit).all()
    if len(candidates)<limit:
        excluded=[b.id for b in candidates]+[l.book_id for l in loans]
        fallback=Book.query.filter(~Book.id.in_(excluded) if excluded else True).order_by(Book.rating.desc(),Book.review_count.desc()).limit(limit-len(candidates)).all()
        candidates.extend(fallback)
    return jsonify([b.to_dict(False) for b in candidates[:limit]])


@app.get('/api/admin/analytics')
@roles('librarian','admin')
def admin_analytics():
    """Operational analytics for the KLH Bachupally library command center."""
    settings = SystemSetting.query.first() or SystemSetting()
    students = User.query.filter_by(role='student').count()
    librarians = User.query.filter_by(role='librarian').count()
    active_members = User.query.filter(User.role == 'student', User.status == 'active').count()
    suspended_members = User.query.filter(User.role == 'student', User.status == 'suspended').count()
    titles = Book.query.count()
    copies = BookCopy.query.count()
    available = BookCopy.query.filter_by(status='available').count()
    issued = BookCopy.query.filter_by(status='issued').count()
    lost = BookCopy.query.filter_by(status='lost').count()
    damaged = BookCopy.query.filter_by(status='damaged').count()
    active_loans = Loan.query.filter(Loan.status != 'returned').all()
    for loan in active_loans:
        refresh_loan_status(loan)
    db.session.commit()
    overdue = sum(l.status == 'overdue' for l in active_loans)
    due_soon = sum(l.status == 'due_soon' for l in active_loans)
    reservations = Reservation.query.filter(Reservation.status.in_(['active','ready'])).count()
    unpaid_fines = [f for f in Fine.query.filter_by(status='unpaid').all()]
    paid_fines = [f for f in Fine.query.filter_by(status='paid').all()]

    # Last six calendar months, including months with zero activity.
    today_d = today().replace(day=1)
    months=[]
    y,m=today_d.year,today_d.month
    for _ in range(6):
        months.append(f'{y:04d}-{m:02d}')
        m-=1
        if m==0: y-=1; m=12
    months=list(reversed(months))
    monthly=[]
    for key in months:
        count=Loan.query.filter(Loan.issue_date.like(f'{key}%')).count()
        returns=Loan.query.filter(Loan.return_date.like(f'{key}%')).count()
        monthly.append({'label':key,'issued':count,'returned':returns})

    category_counts={}
    for loan in Loan.query.all():
        book=db.session.get(Book,loan.book_id)
        if book and book.category:
            category_counts[book.category]=category_counts.get(book.category,0)+1
    category_distribution=[{'label':k,'value':v} for k,v in sorted(category_counts.items(), key=lambda x:(-x[1],x[0]))[:8]]

    department_counts={}
    for loan in Loan.query.all():
        user=db.session.get(User,loan.user_id)
        if user and user.department:
            department_counts[user.department]=department_counts.get(user.department,0)+1
    department_borrowing=[{'label':k,'value':v} for k,v in sorted(department_counts.items(), key=lambda x:(-x[1],x[0]))[:8]]

    popular=[]
    for book in Book.query.all():
        count=Loan.query.filter_by(book_id=book.id).count()
        if count:
            popular.append({'id':book.id,'title':book.title,'author':book.author,'loans':count,'available':book.available_copies,'total':book.total_copies})
    popular.sort(key=lambda x:(-x['loans'],x['title']))

    overdue_by_month=[]
    for key in months:
        count=Loan.query.filter(Loan.status=='overdue', Loan.due_date.like(f'{key}%')).count()
        overdue_by_month.append({'label':key,'value':count})

    return jsonify(
        generatedAt=now_iso(),
        library=settings.library_name,
        campus='Bachupally',
        kpis={
            'students':students,'activeMembers':active_members,'suspendedMembers':suspended_members,
            'librarians':librarians,'titles':titles,'copies':copies,'availableCopies':available,
            'issuedCopies':issued,'lostCopies':lost,'damagedCopies':damaged,'activeLoans':len(active_loans),
            'overdueLoans':overdue,'dueSoonLoans':due_soon,'reservations':reservations,
            'outstandingFines':round(sum(float(f.amount or 0) for f in unpaid_fines),2),
            'paidFines':round(sum(float(f.amount or 0) for f in paid_fines),2),
            'circulationUtilization':round((issued/copies)*100,1) if copies else 0
        },
        monthlyCirculation=monthly,
        categoryDistribution=category_distribution,
        departmentBorrowing=department_borrowing,
        popularBooks=popular[:10],
        overdueTrend=overdue_by_month
    )

@app.get('/api/reports/<report_type>/csv')
@roles('librarian','admin')
def report_csv(report_type):
    """Export operational library datasets as CSV."""
    import csv, io
    output=io.StringIO()
    writer=csv.writer(output)
    report_type=report_type.lower()
    if report_type=='circulation':
        writer.writerow(['Loan ID','Student ID','Student','Book','Issue Date','Due Date','Return Date','Status','Fine','Copy ID'])
        for l in Loan.query.order_by(Loan.issue_date.desc()).all():
            writer.writerow([l.id,l.student_id or '',l.user_name,l.book_title,l.issue_date,l.due_date,l.return_date or '',l.status,f'{l.fine_amount or 0:.2f}',l.copy_id or ''])
    elif report_type=='members':
        writer.writerow(['User ID','University ID','Name','Email','Role','Department','Program','Year','Campus','Status','Library Card'])
        for u in User.query.order_by(User.name).all():
            writer.writerow([u.id,u.student_id or '',u.name,u.email,u.role,u.department or '',u.program or '',u.year or '',u.campus,u.status,u.library_card_id or ''])
    elif report_type=='fines':
        writer.writerow(['Fine ID','Student ID','Student','Book','Due Date','Return Date','Days Overdue','Amount','Status','Paid Date','Payment Method'])
        for f in Fine.query.order_by(Fine.due_date.desc()).all():
            writer.writerow([f.id,f.user_id,f.user_name,f.book_title,f.due_date,f.return_date or '',f.days_overdue,f'{f.amount or 0:.2f}',f.status,f.paid_date or '',f.payment_method or ''])
    elif report_type=='inventory':
        writer.writerow(['Book ID','Title','Author','ISBN','Category','Total Copies','Available Copies','Status','DDC','Floor','Rack','Section'])
        for b in Book.query.order_by(Book.title).all():
            writer.writerow([b.id,b.title,b.author,b.isbn,b.category or '',b.total_copies,b.available_copies,b.status,b.ddc_class or '',b.floor or '',b.rack or '',b.section or ''])
    else:
        return jsonify(error='Unknown report type. Use circulation, members, fines, or inventory.'),400
    from flask import Response
    response=Response(output.getvalue(),mimetype='text/csv')
    response.headers['Content-Disposition']=f'attachment; filename=klh_{report_type}_report_{today().isoformat()}.csv'
    audit('REPORT_EXPORTED',f'Exported {report_type} report',report_type)
    db.session.commit()
    return response

@app.get('/api/dashboard/stats')
@auth_required
def dashboard_stats():
    uid=g.user.id if g.user.role=='student' else None
    loans=Loan.query.filter_by(user_id=uid).filter(Loan.status!='returned').all() if uid else Loan.query.filter(Loan.status!='returned').all()
    fs=Fine.query.filter_by(user_id=uid).all() if uid else Fine.query.all(); rs=Reservation.query.filter_by(user_id=uid).filter(Reservation.status.in_(['active','ready'])).count() if uid else Reservation.query.filter(Reservation.status.in_(['active','ready'])).count()
    return jsonify(currentlyBorrowed=len(loans),dueSoon=sum(l.status=='due_soon' for l in loans),overdue=sum(l.status=='overdue' for l in loans),activeReservations=rs,currentFine=round(sum(f.amount for f in fs if f.status=='unpaid'),2),totalBooks=Book.query.count(),totalMembers=User.query.filter_by(role='student').count(),totalLoansIssued=Loan.query.filter(Loan.status!='returned').count(),totalPendingReservations=Reservation.query.filter(Reservation.status.in_(['active','ready'])).count(),totalOutstandingFines=round(sum(f.amount for f in Fine.query.filter_by(status='unpaid').all()),2))

with app.app_context():
    # Development convenience only. Production schema changes are managed by Alembic/Flask-Migrate.
    if app.config['ENV_MODE'] != 'production':
        db.create_all()
    if app.config['ENV_MODE'] != 'production':
        # Lightweight compatibility migration for databases created by Phase 4 (development databases only).
        try:
            from sqlalchemy import inspect, text
            inspector = inspect(db.engine)
            user_columns = {c['name'] for c in inspector.get_columns('users')}
            additions = {
                'library_card_id': 'VARCHAR(80)',
                'campus': "VARCHAR(120) DEFAULT 'Bachupally'",
                'program': 'VARCHAR(160)',
                'section': 'VARCHAR(80)',
                'notification_preferences': "TEXT DEFAULT '{}'",
            }
            for column, definition in additions.items():
                if column not in user_columns:
                    db.session.execute(text(f'ALTER TABLE users ADD COLUMN {column} {definition}'))
            db.session.commit()
            for u in User.query.all():
                changed=False
                if not u.library_card_id:
                    u.library_card_id=f'KLH-BP-{(u.student_id or u.id).replace(" ","").upper()}'; changed=True
                if not u.campus: u.campus='Bachupally'; changed=True
                if changed: db.session.add(u)
            db.session.commit()
        except Exception as exc:
            db.session.rollback(); print(f'User profile migration skipped: {exc}')
    if app.config['ENV_MODE'] != 'production':
        seed_if_empty()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT',5000)), debug=True)
