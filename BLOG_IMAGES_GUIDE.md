# Blog Images Guide - Medium-Style Image Support

This guide explains how to add beautiful, Medium-style images to your GridMix blog posts.

## Quick Start

### 1. Add Your Images

Place your images in the `public/Assets/blog/` folder (create if it doesn't exist):

```
public/
  Assets/
    blog/
      solar-panels.jpg
      grid-frequency-chart.png
      interconnector-map.jpg
```

### 2. Use Images in Your Blog Posts

In your blog content (in `lib/insights.ts`), use standard markdown image syntax:

```markdown
![Solar panels on a sunny day](Assets/blog/solar-panels.jpg)
```

## Advanced Features

### Image with Caption

Use the pipe `|` separator to add a caption:

```markdown
![Solar panels|Solar PV installation in Southern England generating clean electricity](Assets/blog/solar-panels.jpg)
```

This will display the image with an elegant caption below it.

### Image Sizes

Control image width using size modifiers in the alt text:

#### Small Image (max-width: 28rem / ~450px)
```markdown
![[small] Graph showing frequency deviation](Assets/blog/frequency-graph.png)
```

#### Medium Image (max-width: 42rem / ~672px)
```markdown
![[medium] UK interconnector map](Assets/blog/interconnector-map.jpg)
```

#### Large Image (default - max-width: 56rem / ~896px)
```markdown
![[large] Solar generation curve](Assets/blog/solar-curve.png)
```

#### Full Width
```markdown
![[full] Panoramic view of offshore wind farm](Assets/blog/wind-farm-panorama.jpg)
```

### Combining Caption and Size

```markdown
![[medium] UK Grid Map|Map showing all major interconnectors connecting Great Britain to European grids](Assets/blog/interconnector-map.jpg)
```

## Image Best Practices

### 1. File Naming
- Use descriptive, lowercase names
- Separate words with hyphens
- Example: `solar-duck-curve-2024.png`

### 2. Image Optimization
- Recommended width: 1200-2400px
- Use JPG for photos (quality 80-85%)
- Use PNG for charts, graphs, diagrams
- Use WebP for best compression (when supported)

### 3. File Size
- Target: Under 200KB per image
- Large images: Under 500KB
- Use tools like TinyPNG, ImageOptim, or Squoosh

### 4. Alt Text
- Always provide descriptive alt text
- Describe what's in the image
- Good: "Line graph showing UK grid frequency oscillating between 49.8 and 50.2 Hz"
- Bad: "graph" or "image1"

## Example Blog Post with Images

```javascript
{
  id: '6',
  slug: 'solar-example',
  title: 'Understanding Solar Generation',
  content: `
# Understanding Solar Generation

Solar power has transformed the UK energy landscape.

![Solar panels installation|Modern solar PV installation on a residential rooftop](Assets/blog/solar-installation.jpg)

## The Daily Solar Curve

Solar generation follows a predictable daily pattern. Here's what a typical sunny day looks like:

![[medium] Solar generation curve|Typical solar generation curve showing the "duck curve" effect with peak generation at midday](Assets/blog/solar-duck-curve.png)

Notice how generation:
- Starts at sunrise (around 5-6 AM in summer)
- Peaks at solar noon (12-1 PM)
- Falls off at sunset (8-9 PM in summer)

### Regional Variations

The UK's solar capacity is concentrated in southern regions:

![[small] Solar capacity map|Heat map showing solar PV capacity concentration across the UK](Assets/blog/uk-solar-map.png)

This creates interesting grid balancing challenges during peak solar hours.

## Future Outlook

![[full] Future solar projection|Projected solar capacity growth in the UK through 2050](Assets/blog/solar-future-projection.jpg)

The future is bright for UK solar!
  `,
}
```

## Features of the Image Component

### 1. Lazy Loading
Images load as you scroll, improving page performance.

### 2. Hover Effects
- Subtle scale effect on hover
- Zoom icon appears to indicate clickability

### 3. Lightbox / Full-Screen View
- Click any image to view full-screen
- Click outside or press close button to exit
- Perfect for detailed charts and graphs

### 4. Responsive Design
- Automatically scales for mobile, tablet, desktop
- Maintains aspect ratio
- Optimized for all screen sizes

### 5. Dark Mode Support
- Captions adapt to dark/light themes
- Loading states match theme

### 6. Animations
- Smooth fade-in when scrolling into view
- Professional transitions

## Using External Images

You can also use external URLs:

```markdown
![Grid frequency data|Real-time grid frequency from National Grid ESO](https://example.com/path/to/image.jpg)
```

## Image Organization Tips

### Recommended Folder Structure

```
public/
  Assets/
    blog/
      grid-tech/          # Grid technology images
        frequency-chart.png
        inertia-diagram.jpg
      renewables/         # Renewable energy images
        solar-panels.jpg
        wind-turbines.jpg
        offshore-wind.jpg
      interconnectors/    # Interconnector images
        map-uk-europe.jpg
        hvdc-converter.jpg
      charts/            # Data visualizations
        demand-curve.png
        carbon-intensity-2024.png
      infrastructure/    # Grid infrastructure
        substation.jpg
        transmission-lines.jpg
```

### File Naming Conventions

- **Charts/Graphs**: `[type]-[topic]-[year].png`
  - Example: `line-chart-solar-generation-2024.png`

- **Photos**: `[subject]-[location]-[descriptor].jpg`
  - Example: `wind-turbines-offshore-scotland.jpg`

- **Maps**: `map-[region]-[feature].png`
  - Example: `map-uk-interconnectors.png`

- **Diagrams**: `diagram-[system]-[concept].png`
  - Example: `diagram-grid-frequency-control.png`

## Troubleshooting

### Image Not Showing?

1. **Check the path**: Paths are relative to the `public` folder
   - ✅ Correct: `/Assets/blog/image.jpg`
   - ❌ Wrong: `public/Assets/blog/image.jpg`

2. **Check file extension**: Ensure it matches exactly (case-sensitive on some systems)
   - `image.jpg` ≠ `image.JPG`

3. **Check file exists**: Verify the file is in the correct location

### Caption Not Showing?

Ensure you're using the pipe separator correctly:

```markdown
![Alt text|Caption text here](image.jpg)
     ↑         ↑
   Alt text   Caption
```

### Size Not Working?

Make sure the size modifier is in square brackets within the alt text:

```markdown
![[small] Alt text](image.jpg)
  ↑↑↑↑↑↑↑
  Size modifier
```

## Performance Tips

1. **Optimize before upload**: Use image compression tools
2. **Use appropriate formats**:
   - JPG for photos
   - PNG for graphics with transparency
   - SVG for simple illustrations
3. **Lazy loading is automatic**: Don't worry about it
4. **Consider CDN**: For production, consider using a CDN for images

## Creating Great Visual Blog Posts

### 1. Image Placement
- **Hero image**: Start with a striking image after the intro
- **Section breaks**: Use images to break up long text sections
- **Data visualization**: Include charts/graphs to support your points
- **Before/after**: Show comparisons visually

### 2. Image Frequency
- Aim for 1 image per 2-3 paragraphs of text
- Don't overload - quality over quantity
- Each image should add value

### 3. Captions
- Always caption charts and graphs
- Explain what the reader should notice
- Keep captions concise but informative

### 4. Consistency
- Use similar styling for similar content types
- Maintain consistent quality across images
- Match the tone of your writing

## Example: Before and After

### Before (Text-Only)
```markdown
The UK's solar capacity has grown dramatically. In 2010 we had barely
100 MW. By 2024, we have over 16 GW installed.
```

### After (With Visual Data)
```markdown
The UK's solar capacity has grown dramatically:

![[medium] Solar capacity growth chart|UK solar PV capacity growth from 2010 (100 MW) to 2024 (16+ GW)](Assets/blog/solar-capacity-growth.png)

The chart shows exponential growth, with the steepest increase between
2015-2020 when feed-in tariffs made residential solar economically attractive.
```

## Ready to Start?

1. Create the `public/Assets/blog` folder if it doesn't exist
2. Add your first image
3. Reference it in your blog post markdown
4. See it come to life with beautiful styling!

---

**Questions or issues?** The image component is located in `components/BlogImage.tsx`
