# GridMix

> Real-time UK electricity grid data visualization and analysis platform

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://gridmix.co.uk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

GridMix is a modern web application that provides real-time visualization and analysis of the UK electricity grid. Track carbon intensity, renewable generation, grid frequency, interconnector flows, and more—all updated every 30 seconds.

## 🌟 Features

### Real-Time Monitoring
- **Carbon Intensity** - Live gCO₂/kWh with 48-hour forecast
- **Generation Mix** - Renewable vs fossil fuel breakdown
- **Grid Frequency** - Monitor the 50Hz heartbeat of the grid
- **Interconnectors** - Track electricity flows between UK and Europe
- **Solar Generation** - Intraday solar production curves
- **System Pricing** - Real-time wholesale electricity prices

### Insights & Analysis
- Long-form articles about UK energy infrastructure
- Data-driven analysis of grid trends
- Educational content about renewable energy
- Medium-style blog with rich image support

### Developer API
- RESTful API for grid data access
- Real-time and historical data endpoints
- Comprehensive documentation
- Rate limiting and usage analytics

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Payments**: Stripe
- **Data Fetching**: SWR
- **Markdown**: ReactMarkdown + remark-gfm

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Stripe account (for payment features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/igwebupower/newGridMix.git
   cd newGridMix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local` in the project root:
   ```env
   # Stripe (optional - only needed for support page)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...

   # Site URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
newGridMix/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── insights/          # Blog/insights pages
│   ├── support/           # Support/donation page
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── Header.tsx
│   ├── LiveStatus.tsx
│   ├── BlogImage.tsx      # Medium-style images
│   └── ...
├── lib/                   # Utilities and data fetching
│   ├── api.ts            # Grid data API
│   └── insights.ts       # Blog content
├── public/               # Static assets
│   └── Assets/
│       ├── blog/         # Blog images
│       └── gridmixlogo.png
└── styles/              # Global styles
```

## 🎨 Adding Blog Posts with Images

GridMix supports beautiful, Medium-style images in blog posts:

```markdown
![Solar panels|Solar PV installation in Southern England](Assets/blog/solar-panels.jpg)
```

See [BLOG_IMAGES_GUIDE.md](BLOG_IMAGES_GUIDE.md) for full documentation.

## 🔒 Security

- No secrets committed to repository
- Environment variables for all sensitive data
- Input validation on all API endpoints
- Stripe handles PCI compliance
- Zero known vulnerabilities in dependencies

See [SECURITY.md](SECURITY.md) for detailed security information.

## 📊 Data Sources

GridMix aggregates data from multiple official sources:
- National Grid ESO
- Carbon Intensity API
- Elexon BMRS
- Sheffield Solar (PV Live)

Data is updated every 30 seconds and cached efficiently.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for type safety
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Run `npm audit` before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- National Grid ESO for grid data
- Carbon Intensity API for emissions data
- Sheffield Solar for PV data
- All contributors and supporters

## 📧 Contact

- **Website**: [gridmix.co.uk](https://gridmix.co.uk)
- **Email**: hello@gridmix.co.uk
- **GitHub**: [@igwebupower](https://github.com/igwebupower)

## ⭐ Show Your Support

If GridMix helps you understand the UK energy grid, consider:
- Giving this repo a star ⭐
- Sharing it with others
- Contributing improvements
- Supporting via [gridmix.co.uk/support](https://gridmix.co.uk/support)

---

**Built with ❤️ for a cleaner energy future**
