<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Contact inquiry</title>
</head>
<body style="margin:0;background:#f6f8f5;color:#142118;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8f5;padding:24px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #dfe7dc;border-radius:8px;overflow:hidden;">
                    <tr>
                        <td style="background:#174d2f;color:#ffffff;padding:22px 24px;">
                            <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">TriumphChi Foundation</p>
                            <h1 style="margin:0;font-size:22px;line-height:1.25;">Contact inquiry forwarded</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px;">
                            @if ($note)
                                <div style="margin-bottom:20px;border-left:4px solid #174d2f;background:#eef6ef;padding:14px 16px;">
                                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#174d2f;">Forwarding note</p>
                                    <p style="margin:0;color:#23352a;line-height:1.6;">{{ $note }}</p>
                                </div>
                            @endif

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                                <tr>
                                    <td style="padding:10px 0;width:160px;color:#667466;font-size:13px;">Name</td>
                                    <td style="padding:10px 0;color:#142118;font-weight:700;">{{ $contactMessage->name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;">Email</td>
                                    <td style="padding:10px 0;color:#142118;">{{ $contactMessage->email }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;">Phone</td>
                                    <td style="padding:10px 0;color:#142118;">{{ $contactMessage->phone ?: '-' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;">Reason</td>
                                    <td style="padding:10px 0;color:#142118;">{{ ucfirst(str_replace('_', ' ', $contactMessage->reason)) }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;">Subject</td>
                                    <td style="padding:10px 0;color:#142118;">{{ $contactMessage->subject ?: '-' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;">Submitted</td>
                                    <td style="padding:10px 0;color:#142118;">{{ optional($contactMessage->created_at)->toDayDateTimeString() }}</td>
                                </tr>
                            </table>

                            <div style="margin-top:20px;border-top:1px solid #dfe7dc;padding-top:20px;">
                                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#174d2f;">Message</p>
                                <p style="margin:0;color:#23352a;line-height:1.7;white-space:pre-line;">{{ $contactMessage->message }}</p>
                            </div>

                            <div style="margin-top:20px;border-top:1px solid #dfe7dc;padding-top:16px;color:#667466;font-size:12px;line-height:1.6;">
                                <p style="margin:0;">Forwarded by {{ $forwardedBy->name }} ({{ $forwardedBy->email }}).</p>
                                @if ($contactMessage->attachments_count || $contactMessage->attachments->count())
                                    <p style="margin:8px 0 0;">This inquiry has protected attachments. Open the staff dashboard to review or download them.</p>
                                @endif
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
