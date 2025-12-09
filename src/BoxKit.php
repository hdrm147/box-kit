<?php

namespace Hdrm147\BoxKit;

use Laravel\Nova\Fields\Field;
use Laravel\Nova\Http\Requests\NovaRequest;

class BoxKit extends Field
{
    /**
     * The field's component.
     *
     * @var string
     */
    public $component = 'box-kit-field';

    /**
     * Indicates if the element should be shown on the index view.
     *
     * @var bool
     */
    public $showOnIndex = false;

    /**
     * Resolve the field's value.
     *
     * @param  mixed  $resource
     * @param  string|null  $attribute
     * @return void
     */
    public function resolve($resource, $attribute = null): void
    {
        parent::resolve($resource, $attribute);

        // Get order items with product dimensions
        $items = [];

        if (method_exists($resource, 'items') && $resource->items) {
            $items = $resource->items->map(function ($item) {
                $product = $item->product;

                // Get actual dimensions - don't default to fake values
                $width = $product->width ?? null;
                $height = $product->height ?? null;
                $length = $product->length ?? null;

                // Log warning if dimensions are missing
                if (!$width || !$height || !$length) {
                    \Log::warning("[BoxKit] Product missing dimensions", [
                        'product_id' => $product->id ?? null,
                        'product_name' => $product->name ?? 'Unknown',
                        'width' => $width,
                        'height' => $height,
                        'length' => $length,
                    ]);
                }

                return [
                    'id' => $item->id,
                    'product_id' => $product->id ?? null,
                    'name' => $product->name ?? 'Unknown Product',
                    'qty' => $item->quantity ?? 1,
                    'w' => $width ? (float) $width : null,
                    'h' => $height ? (float) $height : null,
                    'd' => $length ? (float) $length : null,
                    'weight' => (float) ($product->weight ?? 0),
                    'color' => $this->getProductColor($product->component_type ?? 'default'),
                    'hasDimensions' => ($width && $height && $length),
                ];
            })->toArray();
        }

        $this->value = [
            'items' => $items,
            'selectedBox' => $resource->shipping_box ?? null,
            'selectedSupplier' => $resource->box_supplier ?? 'satar',
            'padding' => (float) ($resource->box_padding ?? 0),
        ];
    }

    /**
     * Hydrate the given attribute on the model based on the incoming request.
     *
     * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
     * @param  string  $requestAttribute
     * @param  object  $model
     * @param  string  $attribute
     * @return void
     */
    protected function fillAttributeFromRequest(NovaRequest $request, $requestAttribute, $model, $attribute)
    {
        if ($request->exists($requestAttribute)) {
            $data = json_decode($request[$requestAttribute], true);

            $model->shipping_box = $data['selectedBox'] ?? null;
            $model->box_supplier = $data['selectedSupplier'] ?? 'satar';
            $model->box_padding = $data['padding'] ?? 0;
        }
    }

    /**
     * Get color based on product category.
     *
     * @param  string  $category
     * @return string
     */
    protected function getProductColor(string $category): string
    {
        $colors = [
            'gpu' => '#0ea5e9',
            'cpu' => '#818cf8',
            'motherboard' => '#22c55e',
            'mobo' => '#22c55e',
            'psu' => '#f59e0b',
            'ram' => '#e879f9',
            'cooler' => '#22d3ee',
            'storage' => '#f43f5e',
            'case' => '#64748b',
            'monitor' => '#8b5cf6',
            'peripheral' => '#c084fc',
            'default' => '#94a3b8',
        ];

        return $colors[strtolower($category)] ?? $colors['default'];
    }
}
