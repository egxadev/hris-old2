<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Attendance Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 8px;
            margin: 10px;
        }

        .header {
            text-align: center;
            margin-bottom: 15px;
        }

        .title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .subtitle {
            font-size: 12px;
            margin-bottom: 10px;
        }

        .info {
            margin-bottom: 10px;
            font-size: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7px;
            table-layout: fixed;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 2px 3px;
            text-align: left;
            vertical-align: middle;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
            font-size: 7px;
            text-align: center;
        }

        .compact-cell {
            max-width: 60px;
            word-wrap: break-word;
            font-size: 7px;
        }

        .no-cell {
            width: 10px;
            text-align: center;
        }

        .date-cell {
            width: 50px;
            text-align: center;
        }

        .time-cell {
            width: 45px;
        }

        .status-cell {
            width: 50px;
            text-align: center;
        }

        .name-cell {
            width: 80px;
        }

        .code-cell {
            width: 60px;
        }

        .dept-cell {
            width: 60px;
        }

        .pos-cell {
            width: 60px;
        }

        .shift-cell {
            width: 50px;
            text-align: center;
        }

        .photo-cell {
            width: 40px;
            height: 40px;
            text-align: center;
        }

        .photo-cell img {
            max-width: 50px;
            max-height: 50px;
            border: 1px solid #ddd;
            border-radius: 2px;
        }

        .no-photo {
            color: #999;
            font-size: 6px;
        }

        .footer {
            margin-top: 15px;
            text-align: right;
            font-size: 8px;
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
                <th class="no-cell">No</th>
                <th class="date-cell">Date</th>
                <th class="code-cell">Code</th>
                <th class="name-cell">Name</th>
                <th class="dept-cell">Dept</th>
                <th class="pos-cell">Position</th>
                <th class="shift-cell">Shift</th>
                <th class="time-cell">In</th>
                <th class="photo-cell">In Photo</th>
                <th class="time-cell">Out</th>
                <th class="photo-cell">Out Photo</th>
                <th class="status-cell">Status</th>
                <th class="compact-cell">Duration</th>
            </tr>
        </thead>
        <tbody>
            @forelse($attendances as $index => $attendance)
                <tr>
                    <td class="no-cell">{{ $index + 1 }}</td>
                    <td class="date-cell">{{ \Carbon\Carbon::parse($attendance->date)->format('d/m/Y') }}</td>
                    <td class="code-cell">{{ $attendance->employee->employee_code }}</td>
                    <td class="name-cell">{{ $attendance->employee->user->name }}</td>
                    <td class="dept-cell">{{ $attendance->employee->department->name ?? '-' }}</td>
                    <td class="pos-cell">{{ $attendance->employee->position->name ?? '-' }}</td>
                    <td class="shift-cell">
                        @php
                            $schedule = $attendance->employee->schedules->where('date', $attendance->date)->first();
                            $shiftName = $schedule ? $schedule->shift->name : '-';
                        @endphp
                        {{ $shiftName }}
                    </td>
                    <td class="time-cell">
                        {{ $attendance->check_in_time ? \Carbon\Carbon::parse($attendance->check_in_time)->format('H:i:s') : '-' }}
                    </td>
                    <td class="photo-cell">
                        @if ($attendance->check_in_photo)
                            <img src="{{ $attendance->check_in_photo }}" alt="Check In Photo"
                                style="max-width: 50px; max-height: 50px; border: 1px solid #ddd; border-radius: 2px;">
                        @else
                            <span class="no-photo">No Photo</span>
                        @endif
                    </td>
                    <td class="time-cell">
                        {{ $attendance->check_out_time ? \Carbon\Carbon::parse($attendance->check_out_time)->format('H:i:s') : '-' }}
                    </td>
                    <td class="photo-cell">
                        @if ($attendance->check_out_photo)
                            <img src="{{ $attendance->check_out_photo }}" alt="Check Out Photo"
                                style="max-width: 50px; max-height: 50px; border: 1px solid #ddd; border-radius: 2px;">
                        @else
                            <span class="no-photo">No Photo</span>
                        @endif
                    </td>
                    <td class="status-cell">{{ $attendance->status }}</td>
                    <td class="compact-cell">
                        @if ($attendance->worked_minutes)
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
                    <td colspan="13" style="text-align: center;">No attendance records found</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>This is an automatically generated report. For any questions, please contact the HR department.</p>
    </div>
</body>

</html>
