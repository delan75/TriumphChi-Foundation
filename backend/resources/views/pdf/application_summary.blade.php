<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Application Summary</title>
    <style>
        @page {
            margin: 26px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #17231d;
            background: #f7faf7;
            font-family: "Inter", "Segoe UI", Arial, sans-serif;
            font-size: 13px;
            line-height: 1.55;
        }

        .document {
            background: #ffffff;
            border: 1px solid #dfe8df;
            border-radius: 14px;
            overflow: hidden;
        }

        .hero {
            padding: 28px 32px;
            color: #ffffff;
            background:
                linear-gradient(135deg, rgba(12, 78, 45, 0.96), rgba(38, 112, 63, 0.9)),
                #0c4e2d;
        }

        .eyebrow {
            margin: 0 0 8px;
            color: #d6f5df;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.16em;
            text-transform: uppercase;
        }

        h1 {
            margin: 0;
            font-size: 27px;
            line-height: 1.12;
            letter-spacing: -0.01em;
        }

        .tagline {
            margin: 10px 0 0;
            max-width: 620px;
            color: #edf8ef;
            font-size: 13px;
        }

        .hero-grid {
            display: table;
            width: 100%;
            margin-top: 24px;
            table-layout: fixed;
        }

        .hero-cell {
            display: table-cell;
            padding-right: 14px;
            vertical-align: top;
        }

        .hero-card {
            min-height: 64px;
            padding: 12px 14px;
            border: 1px solid rgba(255, 255, 255, 0.24);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.12);
        }

        .hero-label {
            margin: 0;
            color: #d6f5df;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
        }

        .hero-value {
            margin: 4px 0 0;
            color: #ffffff;
            font-size: 14px;
            font-weight: 800;
        }

        .content {
            padding: 26px 32px 30px;
        }

        .notice {
            margin: 0 0 20px;
            padding: 12px 14px;
            border: 1px solid #bfdbce;
            border-radius: 10px;
            background: #edf8ef;
            color: #17462d;
            font-size: 12px;
        }

        .section {
            margin-top: 18px;
            border: 1px solid #e1e8e1;
            border-radius: 12px;
            background: #ffffff;
            page-break-inside: avoid;
        }

        .section-title {
            margin: 0;
            padding: 12px 16px;
            border-bottom: 1px solid #e1e8e1;
            color: #0c4e2d;
            background: #f2f7f2;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .grid {
            display: table;
            width: 100%;
            table-layout: fixed;
        }

        .col {
            display: table-cell;
            width: 50%;
            padding: 14px 16px;
            vertical-align: top;
        }

        .col + .col {
            border-left: 1px solid #eef3ee;
        }

        .row {
            margin-bottom: 12px;
        }

        .label {
            margin: 0;
            color: #65736b;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .value {
            margin: 3px 0 0;
            color: #17231d;
            font-size: 13px;
            font-weight: 700;
            word-break: break-word;
        }

        .muted {
            color: #8a968d;
            font-weight: 600;
        }

        .text-block {
            margin: 0;
            padding: 14px 16px;
            color: #25352b;
            white-space: pre-wrap;
            word-break: break-word;
        }

        .chips {
            padding: 14px 16px;
        }

        .chip {
            display: inline-block;
            margin: 0 6px 6px 0;
            padding: 6px 9px;
            border-radius: 999px;
            background: #edf8ef;
            color: #17462d;
            font-size: 11px;
            font-weight: 800;
        }

        .footer {
            margin-top: 22px;
            padding-top: 16px;
            border-top: 1px solid #e1e8e1;
            color: #65736b;
            font-size: 11px;
        }

        .signature-grid {
            display: table;
            width: 100%;
            margin-top: 28px;
            table-layout: fixed;
        }

        .signature {
            display: table-cell;
            width: 50%;
            padding-right: 30px;
            vertical-align: bottom;
        }

        .signature-line {
            height: 34px;
            border-bottom: 1px solid #8a968d;
        }

        .signature-caption {
            margin: 8px 0 0;
            color: #65736b;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
@php
    $field = fn (string $key, mixed $fallback = null) => data_get($data, $key, $fallback);
    $display = function (mixed $value): string {
        if (is_array($value)) {
            return implode(', ', array_filter(array_map(fn ($item) => is_scalar($item) ? (string) $item : json_encode($item), $value)));
        }

        if ($value instanceof \BackedEnum) {
            return (string) $value->value;
        }

        if ($value === true) {
            return 'Yes';
        }

        if ($value === false) {
            return 'No';
        }

        $value = trim((string) $value);

        return $value !== '' ? $value : 'Not provided';
    };

    $needType = $field('need_type');
    $status = $application->status instanceof \BackedEnum ? $application->status->value : $application->status;
@endphp

<main class="document">
    <header class="hero">
        <p class="eyebrow">TriumphChi Foundation</p>
        <h1>Education Support Application</h1>
        <p class="tagline">Giving from a covenant, not from leftovers. This summary supports careful review, respectful verification, and accountable follow-up.</p>

        <div class="hero-grid">
            <div class="hero-cell">
                <div class="hero-card">
                    <p class="hero-label">Reference</p>
                    <p class="hero-value">{{ $application->application_number ?? 'DRAFT-PREVIEW' }}</p>
                </div>
            </div>
            <div class="hero-cell">
                <div class="hero-card">
                    <p class="hero-label">Status</p>
                    <p class="hero-value">{{ $isPreview ? 'Preview' : $display($status) }}</p>
                </div>
            </div>
            <div class="hero-cell">
                <div class="hero-card">
                    <p class="hero-label">Generated</p>
                    <p class="hero-value">{{ $generatedAt?->format('M d, Y H:i') }}</p>
                </div>
            </div>
        </div>
    </header>

    <section class="content">
        @if($isPreview)
            <p class="notice">Preview copy. This document reflects the current form details and has not been submitted for review.</p>
        @endif

        <section class="section">
            <h2 class="section-title">Child and Education Details</h2>
            <div class="grid">
                <div class="col">
                    <div class="row">
                        <p class="label">Child name</p>
                        <p class="value">{{ $display($field('child_name')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Gender</p>
                        <p class="value">{{ $display($field('gender')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Date of birth</p>
                        <p class="value">{{ $display($field('date_of_birth')) }}</p>
                    </div>
                </div>
                <div class="col">
                    <div class="row">
                        <p class="label">School</p>
                        <p class="value">{{ $display($field('school_name')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Class or grade</p>
                        <p class="value">{{ $display($field('grade_level')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Enrollment status</p>
                        <p class="value">{{ $display($field('school_enrollment_status')) }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Location and Verification Context</h2>
            <div class="grid">
                <div class="col">
                    <div class="row">
                        <p class="label">Region</p>
                        <p class="value">{{ $display($field('region_name')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Village or community</p>
                        <p class="value">{{ $display($field('village_name')) }}</p>
                    </div>
                </div>
                <div class="col">
                    <div class="row">
                        <p class="label">Last school attended</p>
                        <p class="value">{{ $display($field('last_school_attended')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Interruption reason</p>
                        <p class="value">{{ $display($field('education_interruption_reason')) }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Educational Need</h2>
            <div class="grid">
                <div class="col">
                    <div class="row">
                        <p class="label">Support type</p>
                        <p class="value">{{ $display($needType) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Fee amount</p>
                        <p class="value">{{ $display($field('fee_amount')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Fee due date</p>
                        <p class="value">{{ $display($field('fee_due_date')) }}</p>
                    </div>
                </div>
                <div class="col">
                    <div class="row">
                        <p class="label">Exam name</p>
                        <p class="value">{{ $display($field('exam_name')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Exam date</p>
                        <p class="value">{{ $display($field('exam_date')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Exam fee amount</p>
                        <p class="value">{{ $display($field('exam_fee_amount')) }}</p>
                    </div>
                </div>
            </div>
            <p class="label" style="padding: 0 16px;">Need summary</p>
            <p class="text-block">{{ $display($field('need_summary')) }}</p>
            <p class="label" style="padding: 0 16px;">Situation summary</p>
            <p class="text-block">{{ $display($field('situation_summary')) }}</p>
        </section>

        <section class="section">
            <h2 class="section-title">Household Context</h2>
            <div class="grid">
                <div class="col">
                    <div class="row">
                        <p class="label">Income range</p>
                        <p class="value">{{ $display($field('household_income_range')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Household size</p>
                        <p class="value">{{ $display($field('household_size')) }}</p>
                    </div>
                </div>
                <div class="col">
                    <div class="row">
                        <p class="label">Caregiver occupation</p>
                        <p class="value">{{ $display($field('primary_caregiver_occupation')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Challenges</p>
                        <p class="value">{{ $display($field('household_challenges')) }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Responsible Contact</h2>
            <div class="grid">
                <div class="col">
                    <div class="row">
                        <p class="label">Name</p>
                        <p class="value">{{ $display($field('contact_name')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Relationship or role</p>
                        <p class="value">{{ $display($field('contact_role')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Preferred method</p>
                        <p class="value">{{ $display($field('preferred_contact_method')) }}</p>
                    </div>
                </div>
                <div class="col">
                    <div class="row">
                        <p class="label">Phone</p>
                        <p class="value">{{ $display($field('contact_phone')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Email</p>
                        <p class="value">{{ $display($field('contact_email')) }}</p>
                    </div>
                    <div class="row">
                        <p class="label">Institution</p>
                        <p class="value">{{ $display($field('institution_name', $field('teacher_school_name'))) }}</p>
                    </div>
                </div>
            </div>
        </section>

        <div class="signature-grid">
            <div class="signature">
                <div class="signature-line"></div>
                <p class="signature-caption">Applicant or guardian</p>
            </div>
            <div class="signature">
                <div class="signature-line"></div>
                <p class="signature-caption">Foundation reviewer</p>
            </div>
        </div>

        <p class="footer">
            This document is generated by TriumphChi Foundation for application review and follow-up. Child data must remain protected and handled only through authorized workflows.
        </p>
    </section>
</main>
</body>
</html>
