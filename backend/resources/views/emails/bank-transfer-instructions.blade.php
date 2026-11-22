<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Bank Transfer Instructions</title>
</head>
<body style="margin:0;background:#f6f8f5;color:#142118;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8f5;padding:24px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #dfe7dc;border-radius:8px;overflow:hidden;">
                    <tr>
                        <td style="background:#174d2f;color:#ffffff;padding:22px 24px;">
                            <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">TriumphChi Foundation</p>
                            <h1 style="margin:0;font-size:22px;line-height:1.25;">Bank Transfer Instructions</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px;">
                            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#23352a;">
                                Thank you for choosing to support TriumphChi Foundation. Below are our official banking details and reference number to complete your donation via direct wire transfer or EFT.
                            </p>

                            <div style="margin-bottom:20px;border-left:4px solid #174d2f;background:#eef6ef;padding:14px 16px;">
                                <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#174d2f;">Important Reference Notice</p>
                                <p style="margin:0;color:#23352a;font-size:14px;line-height:1.5;">
                                    Please ensure you include the reference number <strong>{{ $donation->reference_number }}</strong> in your bank transfer description or memo so we can promptly match and confirm your gift.
                                </p>
                            </div>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:20px;">
                                <tr>
                                    <td style="padding:10px 0;width:180px;color:#667466;font-size:13px;border-bottom:1px solid #dfe7dc;">Donation Reference</td>
                                    <td style="padding:10px 0;color:#142118;font-weight:700;font-size:15px;border-bottom:1px solid #dfe7dc;">{{ $donation->reference_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;border-bottom:1px solid #dfe7dc;">Expected Amount</td>
                                    <td style="padding:10px 0;color:#142118;font-weight:700;border-bottom:1px solid #dfe7dc;">{{ number_format($donation->amount, 2) }} {{ $donation->currency }}</td>
                                </tr>
                                @if (!empty($bankDetails['bank_name']))
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;border-bottom:1px solid #dfe7dc;">Bank Name</td>
                                    <td style="padding:10px 0;color:#142118;font-weight:700;border-bottom:1px solid #dfe7dc;">{{ $bankDetails['bank_name'] }}</td>
                                </tr>
                                @endif
                                @if (!empty($bankDetails['account_name']))
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;border-bottom:1px solid #dfe7dc;">Account Name</td>
                                    <td style="padding:10px 0;color:#142118;font-weight:700;border-bottom:1px solid #dfe7dc;">{{ $bankDetails['account_name'] }}</td>
                                </tr>
                                @endif
                                @if (!empty($bankDetails['account_number']))
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;border-bottom:1px solid #dfe7dc;">Account Number / RIB</td>
                                    <td style="padding:10px 0;color:#142118;font-family:monospace;font-size:14px;border-bottom:1px solid #dfe7dc;">{{ $bankDetails['account_number'] }}</td>
                                </tr>
                                @endif
                                @if (!empty($bankDetails['iban']))
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;border-bottom:1px solid #dfe7dc;">IBAN</td>
                                    <td style="padding:10px 0;color:#142118;font-family:monospace;font-size:14px;border-bottom:1px solid #dfe7dc;">{{ $bankDetails['iban'] }}</td>
                                </tr>
                                @endif
                                @if (!empty($bankDetails['swift_bic']))
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;border-bottom:1px solid #dfe7dc;">SWIFT / BIC</td>
                                    <td style="padding:10px 0;color:#142118;font-family:monospace;font-size:14px;border-bottom:1px solid #dfe7dc;">{{ $bankDetails['swift_bic'] }}</td>
                                </tr>
                                @endif
                                @if (!empty($bankDetails['branch']))
                                <tr>
                                    <td style="padding:10px 0;color:#667466;font-size:13px;border-bottom:1px solid #dfe7dc;">Branch</td>
                                    <td style="padding:10px 0;color:#142118;border-bottom:1px solid #dfe7dc;">{{ $bankDetails['branch'] }}</td>
                                </tr>
                                @endif
                            </table>

                            <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#667466;">
                                Once your transfer is submitted, our finance team will verify the payment and confirm your donation. If you have any questions or require assistance, please contact us at support@triumphchi.org.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f6f8f5;padding:16px 24px;border-top:1px solid #dfe7dc;font-size:12px;color:#667466;text-align:center;">
                            TriumphChi Foundation &bull; Supporting orphaned and vulnerable children &bull; <a href="https://triumphchi.org" style="color:#174d2f;text-decoration:none;font-weight:700;">triumphchi.org</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
