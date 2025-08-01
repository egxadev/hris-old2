<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Traits\ResponseFormatter;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    use ResponseFormatter;

    public function attendanceIndex()
    {
        $breadcrumbs = [
            [
                'title' => 'Attendance Report',
                'href' => route('admin.reports.attendance'),
            ],
        ];

        return Inertia::render('admin/reports/attendance/index', array_merge(
            ['breadcrumbs' => $breadcrumbs],
        ));
    }

    public function attendanceReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        $attendances = Attendance::with([
            'employee.user',
            'employee.department',
            'employee.position',
            'employee.schedules.shift'
        ])
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'asc')
            ->get();

        return response()->json($this->successResponse(
            $attendances,
            'Attendance report fetched successfully'
        ));
    }

    public function exportAttendancePdf(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        $attendances = Attendance::with([
            'employee.user',
            'employee.department',
            'employee.position',
            'employee.schedules.shift'
        ])
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'asc')
            ->get();

        $formattedStartDate = Carbon::parse($startDate)->format('d M Y');
        $formattedEndDate = Carbon::parse($endDate)->format('d M Y');

        $pdf = PDF::loadView('reports.attendance', [
            'attendances' => $attendances,
            'startDate' => $formattedStartDate,
            'endDate' => $formattedEndDate,
            'generatedAt' => Carbon::now()->format('d M Y H:i:s'),
        ]);

        return $pdf->download('attendance_report_' . $startDate . '_to_' . $endDate . '.pdf');
    }
}
