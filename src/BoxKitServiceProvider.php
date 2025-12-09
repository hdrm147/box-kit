<?php

namespace Hdrm147\BoxKit;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Laravel\Nova\Events\ServingNova;
use Laravel\Nova\Http\Middleware\Authenticate;
use Laravel\Nova\Nova;

class BoxKitServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->app->booted(function () {
            $this->routes();
        });

        Nova::serving(function (ServingNova $event) {
            Nova::script('box-kit-field', __DIR__ . '/../dist/js/field.js');
            Nova::script('box-kit-tool', __DIR__ . '/../dist/js/tool.js');
            Nova::style('box-kit', __DIR__ . '/../dist/css/boxkit.css');
        });
    }

    /**
     * Register the tool's routes.
     *
     * @return void
     */
    protected function routes()
    {
        if ($this->app->routesAreCached()) {
            return;
        }

        // API routes for the tool
        Route::middleware(['nova', Authenticate::class])
            ->prefix('nova-vendor/box-kit')
            ->group(__DIR__ . '/../routes/api.php');

        // Inertia routes for the tool page
        Nova::router(['nova', Authenticate::class], 'box-kit')
            ->group(__DIR__ . '/../routes/inertia.php');
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
