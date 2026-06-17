<?php

namespace Tests\Feature;

use Tests\TestCase;

class BeneficiaryPrivacyTest extends TestCase
{
    public function test_beneficiary_index_requires_authentication(): void
    {
        $this->getJson('/api/v1/beneficiaries')
            ->assertUnauthorized();
    }
}

