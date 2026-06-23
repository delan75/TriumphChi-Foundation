<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\LaravelPdf\Facades\Pdf;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ApplicationPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_application_pdf_requires_authentication(): void
    {
        $application = $this->makeApplication();

        $this->getJson("/api/v1/applications/{$application->uuid}/pdf")
            ->assertUnauthorized();
    }

    public function test_application_pdf_requires_view_permission(): void
    {
        $application = $this->makeApplication();
        $user = $this->makeActiveUser('staff-no-permission@example.org');

        Sanctum::actingAs($user);

        $this->getJson("/api/v1/applications/{$application->uuid}/pdf")
            ->assertForbidden();
    }

    public function test_authorized_staff_can_preview_application_pdf(): void
    {
        $pdf = Pdf::fake();
        $application = $this->makeApplication();
        $user = $this->makeActiveUser('staff-with-permission@example.org');

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Permission::create([
            'name' => 'applications.view',
            'guard_name' => 'web',
            'group' => 'applications',
        ]);

        $user->givePermissionTo('applications.view');

        Sanctum::actingAs($user);

        $this->getJson("/api/v1/applications/{$application->uuid}/pdf")
            ->assertOk();

        $pdf->assertRespondedWithPdf(function ($generatedPdf): bool {
            return $generatedPdf->viewName === 'pdf.application_summary'
                && data_get($generatedPdf->viewData, 'isPreview') === false
                && data_get($generatedPdf->viewData, 'data.child_name') === 'Dashboard Preview Child'
                && data_get($generatedPdf->viewData, 'data.need_type') === 'fees'
                && data_get($generatedPdf->viewData, 'data.situation_summary') === 'A staff-readable situation summary.';
        });
    }

    private function makeApplication(): Application
    {
        return Application::create([
            'source' => 'online',
            'status' => ApplicationStatus::Submitted,
            'applicant_name' => 'Dashboard Preview Child',
            'guardian_name' => 'Preview Guardian',
            'guardian_phone' => '+237 600 400 500',
            'needs_assessment' => 'A staff-readable need summary.',
            'intake_payload' => [
                'need_type' => 'fees',
                'situation_summary' => 'A staff-readable situation summary.',
            ],
            'submitted_at' => now(),
        ]);
    }

    private function makeActiveUser(string $email): User
    {
        return User::create([
            'name' => 'Staff User',
            'email' => $email,
            'password' => 'password',
            'preferred_locale' => 'en',
            'status' => User::STATUS_ACTIVE,
            'registered_via' => 'local',
            'email_verified_at' => now(),
        ]);
    }
}
