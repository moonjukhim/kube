from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List
import os

app = FastAPI(title="Contacts Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@accounts-db:5432/accounts")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    contact_username = Column(String)
    account_number = Column(String)
    label = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic schemas
class ContactCreate(BaseModel):
    username: str
    contactUsername: str
    accountNumber: str
    label: str

class ContactResponse(BaseModel):
    id: int
    username: str
    contactUsername: str
    accountNumber: str
    label: str

# Dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes
@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/contacts/{username}", response_model=List[ContactResponse])
def get_contacts(username: str, db: Session = Depends(get_db)):
    contacts = db.query(Contact).filter(Contact.username == username).all()
    return [
        ContactResponse(
            id=c.id,
            username=c.username,
            contactUsername=c.contact_username,
            accountNumber=c.account_number,
            label=c.label,
        )
        for c in contacts
    ]

@app.post("/contacts", response_model=ContactResponse)
def add_contact(contact_data: ContactCreate, db: Session = Depends(get_db)):
    # Check if contact already exists
    existing = db.query(Contact).filter(
        Contact.username == contact_data.username,
        Contact.account_number == contact_data.accountNumber
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Contact already exists")
    
    new_contact = Contact(
        username=contact_data.username,
        contact_username=contact_data.contactUsername,
        account_number=contact_data.accountNumber,
        label=contact_data.label,
    )
    
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    
    return ContactResponse(
        id=new_contact.id,
        username=new_contact.username,
        contactUsername=new_contact.contact_username,
        accountNumber=new_contact.account_number,
        label=new_contact.label,
    )

@app.delete("/contacts/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.delete(contact)
    db.commit()
    
    return {"message": "Contact deleted"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

