<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Region;
use App\Models\Position;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Database\Seeders\UserTableSeeder;
use Database\Seeders\RolesTableSeeder;
use Database\Seeders\PermissionsTableSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesTableSeeder::class);
        $this->call(PermissionsTableSeeder::class);
        $this->call(UserTableSeeder::class);

        // Data untuk region, branch, department, position
        $data = [
            'regions' => [
                [
                    'name' => 'DKI Jakarta',
                    'code' => 'DKI',
                ],
                [
                    'name' => 'Jawa Barat', 
                    'code' => 'JBA',
                ],
                [
                    'name' => 'Jawa Tengah',
                    'code' => 'JTE', 
                ],
                [
                    'name' => 'Jawa Timur',
                    'code' => 'JTI',
                ]
            ],
            'branches' => [
                [
                    'name' => 'Jakarta Pusat',
                    'code' => 'JKT-01',
                ],
                [
                    'name' => 'Jakarta Selatan',
                    'code' => 'JKT-02',
                ],
                [
                    'name' => 'Surabaya',
                    'code' => 'SBY',
                ],
                [
                    'name' => 'Bandung',
                    'code' => 'BDG',
                ],
                [
                    'name' => 'Semarang',
                    'code' => 'SMG',
                ],
            ],
            'departments' => [
                [
                    'name' => 'Information Technology',
                    'code' => 'IT',
                ],
                [
                    'name' => 'Human Resources',
                    'code' => 'HR',
                ],
                [
                    'name' => 'Finance',
                    'code' => 'FIN',
                ]
            ],
            'positions' => [
                [
                    'name' => 'Software Engineer',
                    'code' => 'IT-SE',
                ],
                [
                    'name' => 'System Administrator',
                    'code' => 'IT-SA',
                ],
                [
                    'name' => 'HR Manager',
                    'code' => 'HR-MGR',
                ],
                [
                    'name' => 'HR Staff',
                    'code' => 'HR-STF',
                ],
                [
                    'name' => 'Finance Manager',
                    'code' => 'FIN-MGR',
                ],
                [
                    'name' => 'Finance Staff',
                    'code' => 'FIN-STF',
                ]
            ]
        ];

        // Create regions
        foreach ($data['regions'] as $regionData) {
            $region = Region::create($regionData);
            
            // Create branches for each region
            foreach ($data['branches'] as $branchData) {
                // Associate branches with their correct regions
                $createBranch = false;
                
                if ($region->code === 'DKI' && in_array($branchData['code'], ['JKT-01', 'JKT-02'])) {
                    $createBranch = true;
                } elseif ($region->code === 'JBA' && $branchData['code'] === 'BDG') {
                    $createBranch = true;
                } elseif ($region->code === 'JTE' && $branchData['code'] === 'SMG') {
                    $createBranch = true;
                } elseif ($region->code === 'JTI' && $branchData['code'] === 'SBY') {
                    $createBranch = true;
                }
                
                if ($createBranch) {
                    $branch = Branch::create([
                        'name' => $branchData['name'],
                        'code' => $branchData['code'],
                        'region_id' => $region->id
                    ]);
                }
            }
        }
        
        // Create departments independently
        foreach ($data['departments'] as $departmentData) {
            $department = Department::create([
                'name' => $departmentData['name'],
                'code' => $departmentData['code'],
            ]);
            
            // Create positions for each department
            foreach ($data['positions'] as $positionData) {
                if (str_starts_with($positionData['code'], $departmentData['code'])) {
                    Position::create([
                        'name' => $positionData['name'],
                        'code' => $positionData['code'],
                        'department_id' => $department->id
                    ]);
                }
            }
        }
    }
}
