from app.models.label import Label
from app.repositories.base_repository import BaseRepository


class LabelRepository(BaseRepository[Label]):
    model = Label
