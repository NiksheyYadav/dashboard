from enum import Enum


class AppEnvironment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TEST = "test"


class UserRoleEnum(str, Enum):
    ADMIN = "admin"
    DEAN = "dean"
    HOD = "hod"
    TEACHER = "teacher"
    MENTOR = "mentor"
    ACTIVITY_COORDINATOR = "activity_coordinator"


class AttendanceStatusEnum(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    NO_CLASS_CONDUCTED = "no_class_conducted"


class ClassTypeEnum(str, Enum):
    REGULAR = "regular"
    ARRANGEMENT = "arrangement"
    EXTRA = "extra"
    MAKEUP = "makeup"
    ACTIVITY = "activity"


class LeaveStatusEnum(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    ARRANGEMENT_PENDING = "arrangement_pending"
    HOD_PENDING = "hod_pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ArrangementStatusEnum(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class RegularizationStatusEnum(str, Enum):
    SUBMITTED = "submitted"
    HOD_APPROVED = "approved"
    HOD_REJECTED = "rejected"


class WarningStageEnum(str, Enum):
    ADVISORY = "advisory"
    PARENT_INTIMATION = "parent_intimation"
    FORMAL_WARNING = "formal_warning"
    CRITICAL = "critical"
    DETENTION = "detention"


class RiskLevelEnum(str, Enum):
    SAFE = "safe"
    WARNING = "warning"
    CRITICAL = "critical"
    DETENTION = "detention"


class ApprovalStatusEnum(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ImportStatusEnum(str, Enum):
    PENDING = "pending"
    VALIDATING = "validating"
    PREVIEW = "preview"
    COMMITTED = "committed"
    ROLLED_BACK = "rolled_back"
    FAILED = "failed"
