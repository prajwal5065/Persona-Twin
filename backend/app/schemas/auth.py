from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Schema for user registration payload."""

    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    """Schema for explicit JSON-based login (optional, complementary to OAuth2 form)."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for the access-token response."""

    access_token: str
    token_type: str = "bearer"
