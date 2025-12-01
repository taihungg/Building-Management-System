import { Lightbulb, TrendingUp, DollarSign, Users, AlertTriangle, Sparkles, Target, BarChart3 } from 'lucide-react';

const recommendations = [
  {
    id: 1,
    category: 'Revenue',
    icon: DollarSign,
    title: 'Optimize Rent Pricing',
    description: 'Market analysis shows you could increase rent by 5-8% for 2BR units based on local competition.',
    impact: 'High',
    potential: '+$12,000/year',
    color: 'emerald',
    actions: ['Review market rates', 'Update pricing strategy', 'Plan tenant communication']
  },
  {
    id: 2,
    category: 'Occupancy',
    icon: Users,
    title: 'Reduce Vacancy Time',
    description: 'Average vacancy period is 45 days. Implementing virtual tours could reduce this by 30%.',
    impact: 'High',
    potential: '-15 days vacancy',
    color: 'blue',
    actions: ['Set up virtual tour system', 'Improve online listings', 'Streamline application process']
  },
  {
    id: 3,
    category: 'Maintenance',
    icon: AlertTriangle,
    title: 'Preventive Maintenance Plan',
    description: 'HVAC systems in units 200-220 are over 8 years old. Schedule preventive maintenance to avoid costly repairs.',
    impact: 'Medium',
    potential: 'Save $8,000',
    color: 'orange',
    actions: ['Schedule HVAC inspections', 'Budget for replacements', 'Create maintenance schedule']
  },
  {
    id: 4,
    category: 'Operations',
    icon: TrendingUp,
    title: 'Automate Payment Reminders',
    description: 'Late payments decreased by 40% in similar buildings using automated reminders 3 days before due date.',
    impact: 'Medium',
    potential: 'Improve cash flow',
    color: 'purple',
    actions: ['Enable auto-reminders', 'Set up payment portal', 'Create reminder schedule']
  },
  {
    id: 5,
    category: 'Satisfaction',
    icon: Sparkles,
    title: 'Add Amenities',
    description: 'Survey data shows 68% of residents interested in package locker system and co-working space.',
    impact: 'Medium',
    potential: '+12% retention',
    color: 'blue',
    actions: ['Conduct resident survey', 'Evaluate costs', 'Plan implementation']
  },
  {
    id: 6,
    category: 'Efficiency',
    icon: Target,
    title: 'Energy Efficiency Upgrade',
    description: 'Installing LED lighting and smart thermostats could reduce utility costs by 20-25%.',
    impact: 'Low',
    potential: 'Save $3,600/year',
    color: 'emerald',
    actions: ['Get quotes for upgrades', 'Calculate ROI', 'Plan phased implementation']
  },
];

const insights = [
  { label: 'Revenue Potential', value: '+$23,600/year', icon: DollarSign, color: 'emerald' },
  { label: 'Cost Savings', value: '$11,600', icon: TrendingUp, color: 'blue' },
  { label: 'Efficiency Gains', value: '25%', icon: Target, color: 'purple' },
  { label: 'Resident Satisfaction', value: '+15%', icon: Sparkles, color: 'orange' },
];

export function Recommendations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900">AI Recommendations</h1>
          <p className="text-slate-500 mt-1">Data-driven insights to optimize your building management</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">
          <Sparkles className="w-5 h-5" />
          <span>6 Active Recommendations</span>
        </div>
      </div>

      {/* Impact Overview */}
      <div className="grid grid-cols-4 gap-6">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.label} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg bg-${insight.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${insight.color}-600`} />
                </div>
                <p className="text-slate-500 text-sm">{insight.label}</p>
              </div>
              <p className="text-2xl text-slate-900">{insight.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          
          return (
            <div key={rec.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${
                  rec.color === 'emerald' ? 'from-emerald-400 to-emerald-600' :
                  rec.color === 'blue' ? 'from-blue-400 to-blue-600' :
                  rec.color === 'orange' ? 'from-orange-400 to-orange-600' :
                  'from-purple-400 to-purple-600'
                }`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl text-slate-900">{rec.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          rec.impact === 'High' ? 'bg-red-50 text-red-700' :
                          rec.impact === 'Medium' ? 'bg-orange-50 text-orange-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {rec.impact} Impact
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{rec.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Potential</p>
                      <p className={`text-lg ${rec.color === 'emerald' ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {rec.potential}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-4">{rec.description}</p>

                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Suggested Actions:</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.actions.map((action, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="w-5 h-5 rounded border-2 border-slate-300" />
                          <span className="text-sm text-slate-700">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                      Implement
                    </button>
                    <button className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      Learn More
                    </button>
                    <button className="px-6 py-2 text-slate-500 hover:text-slate-700 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-8 h-8" />
          <h2 className="text-2xl">Performance Score</h2>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-blue-100 mb-1">Overall Efficiency</p>
            <p className="text-4xl">82%</p>
            <p className="text-blue-100 text-sm mt-1">+5% from last month</p>
          </div>
          <div>
            <p className="text-blue-100 mb-1">Resident Satisfaction</p>
            <p className="text-4xl">4.6/5</p>
            <p className="text-blue-100 text-sm mt-1">Based on 156 reviews</p>
          </div>
          <div>
            <p className="text-blue-100 mb-1">ROI on Improvements</p>
            <p className="text-4xl">218%</p>
            <p className="text-blue-100 text-sm mt-1">Last 12 months</p>
          </div>
        </div>
      </div>
    </div>
  );
}
