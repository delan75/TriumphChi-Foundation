<!doctype html>
<html lang="{{ $document->locale }}">
<head>
    <meta charset="utf-8">
    <title>{{ $document->title }} - {{ $document->document_number }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            background: #f6f8f4;
            color: #17211b;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 13px;
            line-height: 1.5;
        }
        .page { padding: 30px; }
        .sheet {
            overflow: hidden;
            border: 1px solid #dfe8dc;
            border-radius: 10px;
            background: #fff;
        }
        .hero {
            padding: 30px;
            background: #123525;
            color: #fff;
        }
        .hero h1 {
            margin: 8px 0 0;
            font-size: 30px;
            line-height: 1.15;
        }
        .eyebrow {
            margin: 0;
            color: #cfe4c7;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
        }
        .status {
            display: inline-block;
            margin-top: 18px;
            border-radius: 999px;
            background: #d9f8df;
            color: #14532d;
            padding: 7px 12px;
            font-weight: 700;
        }
        .content { padding: 28px 30px 32px; }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        .card {
            border: 1px solid #e5ece2;
            border-radius: 8px;
            padding: 16px;
            background: #fbfdf9;
        }
        .label {
            margin: 0 0 5px;
            color: #6c766d;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .value {
            margin: 0;
            color: #17211b;
            font-size: 15px;
            font-weight: 700;
        }
        .amount {
            font-size: 32px;
            color: #123525;
        }
        .message {
            margin-top: 20px;
            border-left: 4px solid #2f7d4a;
            padding: 14px 16px;
            background: #f2f8ef;
            color: #26352a;
        }
        .footer {
            margin-top: 24px;
            padding-top: 18px;
            border-top: 1px solid #e5ece2;
            color: #6c766d;
            font-size: 11px;
        }
    </style>
</head>
<body>
@php
    $snapshot = $document->snapshot ?? [];
    $donation = $snapshot['donation'] ?? [];
    $donor = $snapshot['donor'] ?? [];
    $fund = $snapshot['fund'] ?? [];
    $organization = $snapshot['organization'] ?? [];
    $locale = $snapshot['locale'] ?? 'en';
@endphp
<main class="page">
    <section class="sheet">
        <header class="hero">
            <p class="eyebrow">{{ $organization['name'] ?? config('app.name') }}</p>
            <h1>{{ $document->title }}</h1>
            <p class="status">{{ $locale === 'fr' ? 'Don confirme' : 'Confirmed donation' }}</p>
        </header>
        <section class="content">
            <div class="grid">
                <div class="card">
                    <p class="label">{{ $locale === 'fr' ? 'Numero du document' : 'Document number' }}</p>
                    <p class="value">{{ $document->document_number }}</p>
                </div>
                <div class="card">
                    <p class="label">{{ $locale === 'fr' ? 'Reference du don' : 'Donation reference' }}</p>
                    <p class="value">{{ $donation['reference_number'] ?? '-' }}</p>
                </div>
                <div class="card">
                    <p class="label">{{ $locale === 'fr' ? 'Donateur' : 'Donor' }}</p>
                    <p class="value">{{ $donor['name'] ?? '-' }}</p>
                </div>
                <div class="card">
                    <p class="label">{{ $locale === 'fr' ? 'Fonds' : 'Fund' }}</p>
                    <p class="value">{{ $fund['name'] ?? '-' }}</p>
                </div>
                <div class="card">
                    <p class="label">{{ $locale === 'fr' ? 'Methode' : 'Method' }}</p>
                    <p class="value">{{ $donation['provider'] ?? $donation['method'] ?? '-' }}</p>
                </div>
                <div class="card">
                    <p class="label">{{ $locale === 'fr' ? 'Reference prestataire' : 'Provider reference' }}</p>
                    <p class="value">{{ $donation['provider_reference'] ?? '-' }}</p>
                </div>
            </div>
            <div class="card" style="margin-top: 18px;">
                <p class="label">{{ $locale === 'fr' ? 'Montant confirme' : 'Confirmed amount' }}</p>
                <p class="value amount">{{ $donation['amount'] ?? '0.00' }} {{ $donation['currency'] ?? '' }}</p>
            </div>
            <div class="message">
                {{ $snapshot['message'] ?? '' }}
            </div>
            <p class="footer">
                {{ $organization['mission'] ?? '' }}<br>
                {{ $locale === 'fr' ? 'Emis le' : 'Issued on' }} {{ optional($document->issued_at)->format('Y-m-d H:i') }}
            </p>
        </section>
    </section>
</main>
</body>
</html>
