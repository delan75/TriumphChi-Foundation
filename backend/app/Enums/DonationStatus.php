<?php

namespace App\Enums;

enum DonationStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Failed = 'failed';
    case Refunded = 'refunded';
}

