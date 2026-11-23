<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\PasswordResetCode;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email:rfc,filter',
                'max:255',
                'unique:users,email',
            ],
            'phone' => 'nullable|string|max:30',
            'password' => [
                'required',
                'string',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ], [
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address (e.g., name@example.com).',
            'email.unique' => 'This email address is already registered. Please login or use a different email.',
        ]);

        $phone = !empty($validated['phone']) ? trim($validated['phone']) : null;

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'phone' => $phone,
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        // Create associated customer profile
        $customer = Customer::firstOrCreate(
            ['email' => $user->email],
            [
                'name' => $user->name,
                'phone' => $phone,
                'user_id' => $user->id,
                'status' => 'active',
            ]
        );
        if (!$customer->user_id) {
            $customer->update([
                'user_id' => $user->id,
                'phone' => $customer->phone ?: $phone,
            ]);
        } elseif ($phone && !$customer->phone) {
            $customer->update(['phone' => $phone]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Account created successfully!',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role ? $user->role->slug : 'customer',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role ? $user->role->slug : 'customer',
                ],
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Check if an email is available or already registered.
     */
    public function checkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email:rfc,filter'],
        ], [
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address (e.g., name@example.com).',
        ]);

        $exists = User::where('email', strtolower(trim($request->email)))->exists();

        return response()->json([
            'status' => 'success',
            'available' => !$exists,
            'message' => $exists
                ? 'This email address is already registered. Please login or use a different email.'
                : 'Email is available.',
        ]);
    }

    /**
     * Authenticate user and issue token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('role')->where('email', strtolower(trim($request->email)))->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        $tokenName = $request->boolean('rememberMe') ? 'remember-token' : 'auth-token';
        $token = $user->createToken($tokenName)->plainTextToken;

        $roleName = $user->role ? $user->role->slug : 'customer';

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful!',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $roleName,
                'avatar' => $user->avatar,
                'phone' => $user->phone,
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $roleName,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                ],
            ],
            'token' => $token,
        ]);
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated',
            ], 401);
        }

        $user->load('role', 'customer');
        $customer = $user->customer;

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? $customer?->phone,
                'avatar' => $user->avatar ?? $customer?->avatar,
                'address' => $customer?->address,
                'city' => $customer?->city,
                'postal_code' => $customer?->postal_code,
                'role' => $user->role ? $user->role->slug : 'customer',
            ],
        ]);
    }

    /**
     * Update user profile settings.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated',
            ], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'avatar' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
        ]);

        $user->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? $user->phone,
            'avatar' => $validated['avatar'] ?? $user->avatar,
        ]);

        $customer = Customer::firstOrCreate(
            ['email' => $user->email],
            ['name' => $user->name, 'user_id' => $user->id]
        );

        $customer->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? $customer->phone,
            'avatar' => $validated['avatar'] ?? $customer->avatar,
            'address' => $validated['address'] ?? $customer->address,
            'city' => $validated['city'] ?? $customer->city,
            'postal_code' => $validated['postal_code'] ?? $customer->postal_code,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully!',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'address' => $customer->address,
                'city' => $customer->city,
                'postal_code' => $customer->postal_code,
            ],
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated',
            ], 401);
        }

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => [
                'required',
                'string',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided current password does not match our records.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password updated successfully!',
        ]);
    }

    /**
     * Send password reset verification code.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'We could not find an account with that email address.',
            ], 404);
        }

        // Generate 6-digit OTP code
        $code = str_pad((string) mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT);

        // Delete any existing codes for this email
        PasswordResetCode::where('email', $email)->delete();

        PasswordResetCode::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => now()->addMinutes(15),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Verification code sent to your email.',
            'data' => [
                'email' => $email,
                'code' => $code, // Returned for convenient development / testing
            ],
        ]);
    }

    /**
     * Verify OTP code and issue a reset token.
     */
    public function verifyCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $email = strtolower(trim($request->email));
        $code = trim($request->input('code', $request->input('otp')));

        $record = PasswordResetCode::where('email', $email)
            ->where('code', $code)
            ->where('expires_at', '>', now())
            ->first();

        if (!$record) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid or expired verification code.',
            ], 422);
        }

        $resetToken = Str::random(40);
        $record->update([
            'token' => $resetToken,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'OTP verified successfully.',
            'data' => [
                'resetToken' => $resetToken,
            ],
        ]);
    }

    /**
     * Reset password using reset token.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'resetToken' => 'required|string',
            'newPassword' => [
                'required',
                'string',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        $email = strtolower(trim($request->email));
        $resetToken = $request->resetToken;

        $record = PasswordResetCode::where('email', $email)
            ->where('token', $resetToken)
            ->where('expires_at', '>', now())
            ->first();

        if (!$record) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid or expired session token. Please request a new code.',
            ], 422);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found.',
            ], 404);
        }

        $user->update([
            'password' => Hash::make($request->newPassword),
        ]);

        // Cleanup
        $record->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Password reset successfully!',
        ]);
    }

    /**
     * Logout authenticated user.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user() ?: auth('sanctum')->user();
        if ($user) {
            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully.',
        ]);
    }
}
