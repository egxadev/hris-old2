<?php

namespace App\Services;

use App\Models\Region;
use App\Traits\ResponseFormatter;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RegionService
{
    use ResponseFormatter;

    private const DEFAULT_PER_PAGE = 10;
    private const DEFAULT_SORT_BY = 'name';
    private const DEFAULT_SORT_DIR = 'asc';
    private const FILTERABLE_COLUMNS = ['name', 'code', 'created_at'];

    /**
     * Get paginated regions with filters.
     *
     * @param array $filters
     * @return array
     */
    public function getPaginatedRegions(array $filters): array
    {
        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);
        $page = (int) ($filters['page'] ?? 1);
        $sortBy  = in_array($sort = $filters['sort_by'] ?? self::DEFAULT_SORT_BY, self::FILTERABLE_COLUMNS) ? $sort : self::DEFAULT_SORT_BY;
        $sortDir = in_array($dir = strtolower($filters['sort_dir'] ?? self::DEFAULT_SORT_DIR), ['asc', 'desc']) ? $dir : self::DEFAULT_SORT_DIR;

        $search = trim($filters['search'] ?? '');

        $query = Region::query();

        $query->when($search, function ($query) use ($search) {
            $query->where(function ($subQuery) use ($search) {
                foreach (self::FILTERABLE_COLUMNS as $column) {
                    $subQuery->orWhere($column, 'like', "%{$search}%");
                }
            });
        });

        $query->orderBy($sortBy, $sortDir);

        $data = $query->paginate($perPage, ['*'], 'page', $page);

        return $this->paginatedResponse($data->items(), [
            'current_page'  => $data->currentPage(),
            'last_page'     => $data->lastPage(),
            'per_page'      => $data->perPage(),
            'total'         => $data->total(),
            'from'          => $data->firstItem(),
            'to'            => $data->lastItem(),
        ], [
            'search'        => $search,
            'sort_by'       => $sortBy,
            'sort_dir'      => $sortDir,
        ]);
    }

    /**
     * Create a new region.
     *
     * @param array $data
     * @return array
     */
    public function createRegion(array $data): array
    {
        try {
            $createdData = \DB::transaction(function () use ($data) {
                $region = Region::create([
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'created_by'    => auth()->id()
                ]);

                return $region;
            });

            return $this->successResponse($createdData, 'Region created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create region: ' . $e->getMessage());
            return $this->errorResponse('Failed to create region.');
        }
    }

    /**
     * Update region.
     *
     * @param Region $region
     * @param array $data
     * @return Region
     */
    public function updateRegion(Region $region, array $data): array
    {
        try {
            $updatedData = \DB::transaction(function () use ($region, $data) {
                $region->update([
                    'name'          => $data['name'],
                    'code'          => $data['code'],
                    'updated_by'    => auth()->id()
                ]);
                return $region;
            });

            return $this->successResponse($updatedData, 'Region updated successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Region not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to update region: ' . $e->getMessage());
            return $this->errorResponse('Failed to update region.');
        }
    }

    /**
     * Delete region by ID.
     *
     * @param string $id
     * @return array
     */
    public function deleteRegion(string $id): array
    {
        try {
            $region = Region::findOrFail($id);

            \DB::transaction(function () use ($region) {
                $region->update(['deleted_by' => auth()->id()]);
                $region->delete();
            });

            return $this->successResponse(null, 'Region deleted successfully.');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Region not found.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete region: ' . $e->getMessage());
            return $this->errorResponse('Failed to delete region.');
        }
    }
}
