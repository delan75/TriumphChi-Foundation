<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Summary</title>
    <!-- Tailwind CSS included directly for Puppeteer to render properly -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-white text-gray-900 p-8">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center border-b pb-4 mb-8">
            <div>
                <h1 class="text-3xl font-bold">Public Education Support Application</h1>
                <p class="text-gray-500 mt-2">Reference: <span class="font-semibold text-gray-800">{{ $application->application_number }}</span></p>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500">Date Submitted</p>
                <p class="font-medium">{{ $application->submitted_at ? $application->submitted_at->format('M d, Y H:i') : 'Draft' }}</p>
            </div>
        </div>

        <!-- Section 1: Child Details -->
        <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4 border-b pb-2">1. Child Information</h2>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Full Name</p>
                    <p class="font-medium">{{ $data['child_name'] ?? 'N/A' }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Gender</p>
                    <p class="font-medium capitalize">{{ $data['gender'] ?? 'N/A' }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Date of Birth</p>
                    <p class="font-medium">{{ $data['date_of_birth'] ?? 'N/A' }}</p>
                </div>
            </div>
        </div>

        <!-- Section 2: Education Need -->
        <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4 border-b pb-2">2. Education & Need Assessment</h2>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-sm text-gray-500">School Name</p>
                    <p class="font-medium">{{ $data['school_name'] ?? 'N/A' }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Grade Level</p>
                    <p class="font-medium">{{ $data['grade_level'] ?? 'N/A' }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Need Type</p>
                    <p class="font-medium capitalize">{{ $data['need_type'] ?? 'N/A' }}</p>
                </div>
            </div>
            <div class="mb-4">
                <p class="text-sm text-gray-500">Need Summary</p>
                <p class="bg-gray-50 p-4 rounded mt-1">{{ $data['need_summary'] ?? 'N/A' }}</p>
            </div>
            <div>
                <p class="text-sm text-gray-500">Situation Summary</p>
                <p class="bg-gray-50 p-4 rounded mt-1">{{ $data['situation_summary'] ?? 'N/A' }}</p>
            </div>
        </div>

        <!-- Section 3: Contact Person -->
        <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4 border-b pb-2">3. Responsible Contact</h2>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Name</p>
                    <p class="font-medium">{{ $data['contact_name'] ?? 'N/A' }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Role/Relationship</p>
                    <p class="font-medium capitalize">{{ $data['contact_role'] ?? 'N/A' }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Phone</p>
                    <p class="font-medium">{{ $data['contact_phone'] ?? 'N/A' }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="font-medium">{{ $data['contact_email'] ?? 'N/A' }}</p>
                </div>
            </div>
        </div>

        <!-- Signatures -->
        <div class="mt-16 pt-8 border-t border-gray-300">
            <h2 class="text-xl font-semibold mb-8">Signatures & Approvals</h2>
            <div class="grid grid-cols-2 gap-12">
                <div>
                    <p class="text-sm text-gray-500 mb-8">Applicant / Guardian Signature</p>
                    <div class="border-b border-gray-400 w-full mb-2"></div>
                    <p class="text-xs text-gray-400">Date: ____________________</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-8">Internal Reviewer Signature</p>
                    <div class="border-b border-gray-400 w-full mb-2"></div>
                    <p class="text-xs text-gray-400">Date: ____________________</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
