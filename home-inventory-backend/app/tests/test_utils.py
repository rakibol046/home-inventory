import pytest
from fastapi import status
from app.utils.exceptions import (
    NotFoundException, ForbiddenException, ConflictException, BadRequestException
)


def test_not_found_exception():
    exc = NotFoundException("Item")
    assert exc.status_code == status.HTTP_404_NOT_FOUND
    assert "Item" in exc.detail


def test_not_found_exception_default():
    exc = NotFoundException()
    assert exc.status_code == status.HTTP_404_NOT_FOUND
    assert "Resource" in exc.detail


def test_forbidden_exception():
    exc = ForbiddenException()
    assert exc.status_code == status.HTTP_403_FORBIDDEN
    assert "Forbidden" in exc.detail


def test_conflict_exception():
    exc = ConflictException("User already exists")
    assert exc.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in exc.detail


def test_bad_request_exception():
    exc = BadRequestException("Invalid input")
    assert exc.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid input" in exc.detail
