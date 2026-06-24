<?php

namespace App\Mail;

use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMessageForwarded extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public ContactMessage $contactMessage,
        public ?string $note,
        public User $forwardedBy,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->contactMessage->subject ?: ucfirst(str_replace('_', ' ', $this->contactMessage->reason));

        return new Envelope(
            subject: "Contact inquiry: {$subject}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-message-forwarded',
        );
    }
}
