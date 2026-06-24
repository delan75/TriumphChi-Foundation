<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);
        $this->call(ApplicationStepSeeder::class);
        $this->call(ApplicationVerificationContactSeeder::class);
        $this->call(ApplicationDocumentSeeder::class);
        $this->call(ApplicationEducationDetailSeeder::class);
    }
}

