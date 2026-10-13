from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class QuizOptionPublic(BaseModel):
    id: str
    option_text: str
    order_index: int

    class Config:
        from_attributes = True

class QuizQuestionPublic(BaseModel):
    id: str
    question_text: str
    order_index: int
    options: List[QuizOptionPublic]

    class Config:
        from_attributes = True

class QuizPublicResponse(BaseModel):
    id: str
    lesson_id: str
    title: str
    description: Optional[str] = None
    passing_score_percent: int
    max_attempts: int
    questions: List[QuizQuestionPublic]

    class Config:
        from_attributes = True

class QuestionAnswerSubmission(BaseModel):
    question_id: str
    selected_option_id: str

class QuizSubmission(BaseModel):
    answers: List[QuestionAnswerSubmission]

class QuestionFeedback(BaseModel):
    question_id: str
    is_correct: bool
    explanation: Optional[str] = None
    correct_option_id: str

class QuizResultResponse(BaseModel):
    quiz_id: str
    score_percent: int
    passed: bool
    passing_score_percent: int
    attempt_number: int
    feedback: List[QuestionFeedback]
    certificate_generated: Optional[bool] = False
    certificate_code: Optional[str] = None
