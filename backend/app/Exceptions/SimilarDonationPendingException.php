<?php

namespace App\Exceptions;

use RuntimeException;

class SimilarDonationPendingException extends RuntimeException
{
    public function __construct(public readonly array $similarDonation)
    {
        parent::__construct(__('api.errors.similar_donation_pending'));
    }
}
