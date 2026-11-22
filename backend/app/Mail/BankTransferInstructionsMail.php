<?php

namespace App\Mail;

use App\Models\Donation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BankTransferInstructionsMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public Donation $donation,
        public array $bankDetails,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "TriumphChi Foundation - Bank Transfer Instructions (Ref: {$this->donation->reference_number})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bank-transfer-instructions',
        );
    }
}
