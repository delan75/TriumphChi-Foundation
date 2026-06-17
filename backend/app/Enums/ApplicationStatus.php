<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case VerificationPending = 'verification_pending';
    case Verified = 'verified';
    case ReviewPending = 'review_pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, match ($this) {
            self::Draft => [self::Submitted],
            self::Submitted => [self::VerificationPending, self::Rejected],
            self::VerificationPending => [self::Verified, self::Rejected],
            self::Verified => [self::ReviewPending],
            self::ReviewPending => [self::Accepted, self::Rejected],
            self::Accepted, self::Rejected => [],
        }, true);
    }
}

