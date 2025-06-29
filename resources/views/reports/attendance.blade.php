<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Attendance Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 14px;
            margin-bottom: 15px;
        }
        .info {
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 10px;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Employee Attendance Report</div>
        <div class="subtitle">Period: {{ $startDate }} - {{ $endDate }}</div>
    </div>

    <div class="info">
        <p><strong>Generated:</strong> {{ $generatedAt }}</p>
        <p><strong>Total Records:</strong> {{ count($attendances) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Date</th>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Work Duration</th>
            </tr>
        </thead>
        <tbody>
            @forelse($attendances as $index => $attendance)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($attendance->date)->format('d/m/Y') }}</td>
                    <td>{{ $attendance->employee->employee_code }}</td>
                    <td>{{ $attendance->employee->user->name }}</td>
                    <td>{{ $attendance->employee->department->name ?? '-' }}</td>
                    <td>{{ $attendance->employee->position->name ?? '-' }}</td>
                    <td>{{ $attendance->check_in_time ? \Carbon\Carbon::parse($attendance->check_in_time)->format('H:i:s') : '-' }}</td>
                    <td>{{ $attendance->check_out_time ? \Carbon\Carbon::parse($attendance->check_out_time)->format('H:i:s') : '-' }}</td>
                    <td>{{ $attendance->status }}</td>
                    <td>
                        @if($attendance->worked_minutes)
                            @php
                                $hours = floor($attendance->worked_minutes / 60);
                                $minutes = $attendance->worked_minutes % 60;
                            @endphp
                            {{ $hours }}h {{ $minutes }}m
                        @else
                            -
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" style="text-align: center;">No attendance records found</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>This is an automatically generated report. For any questions, please contact the HR department.</p>
    </div>
</body>
</html> 