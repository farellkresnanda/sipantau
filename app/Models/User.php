<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'password_confirmation',
        'npp',
        'npp_sap',
        'email_verified_at',
        'remember_token',
        'position_code',
        'position_name',
        'position_level',
        'position_level_name',
        'entity_group_code',
        'entity_code',
        'entity_name',
        'entity_alias_name',
        'directorate_code',
        'directorate_name',
        'division_code',
        'division_name',
        'unit_code',
        'unit_name',
        'sub_unit_code',
        'sub_unit_name',
        'department_code',
        'department_name',
        'branch_manager_code',
        'branch_manager_name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
