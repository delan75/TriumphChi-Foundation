<?php

namespace App\Enums;

enum BeneficiaryStatus: string
{
    case AwaitingSponsorship = 'awaiting_sponsorship';
    case PartiallyFunded = 'partially_funded';
    case FullyFunded = 'fully_funded';
    case ActiveSupport = 'active_support';
    case Graduated = 'graduated';
    case Archived = 'archived';
}

