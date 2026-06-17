<?php

namespace App\Enums;

enum NeedStatus: string
{
    case Open = 'open';
    case PartiallyFunded = 'partially_funded';
    case Funded = 'funded';
    case Paid = 'paid';
    case Cancelled = 'cancelled';
}

