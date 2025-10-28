import React, { useState } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  BookOpen,
  Users,
  Settings,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const ImprovementSuggestions = ({ reports = [], assignments = [] }) => {
  const [dismissed, setDismissed] = useState(new Set());

  const generateSuggestions = () => {
    const suggestions = [];
    const completedReports = reports.filter(r => r.status === 'completed');
    
    if (completedReports.length === 0) {
      return [{
        id: 'getting_started',
        title: 'Get Started with Analysis',
        description: 'Upload your first assignment to see how our AI and plagiarism detection works.',
        action: 'Upload Assignment',
        actionUrl: '/assignments/upload',
        icon: BookOpen,
        color: 'blue',
        priority: 'high'
      }];
    }

    // High AI detection rates
    const highAIReports = completedReports.filter(r => (r.ai_probability || 0) > 0.7);
    if (highAIReports.length > completedReports.length * 0.3) {
      suggestions.push({
        id: 'ai_policy_review',
        title: 'Review AI Usage Policies',
        description: `${highAIReports.length} assignments show high AI probability. Consider updating your AI usage guidelines.`,
        action: 'Create AI Policy',
        icon: Target,
        color: 'purple',
        priority: 'high'
      });
    }

    // High plagiarism rates
    const highPlagiarismReports = completedReports.filter(r => (r.plagiarism_score || 0) > 0.5);
    if (highPlagiarismReports.length > completedReports.length * 0.2) {
      suggestions.push({
        id: 'citation_training',
        title: 'Provide Citation Training',
        description: `${highPlagiarismReports.length} assignments have significant similarity. Students may need citation guidance.`,
        action: 'Send Resources',
        icon: BookOpen,
        color: 'orange',
        priority: 'high'
      });
    }

    // Workflow improvements
    if (completedReports.length > 10) {
      suggestions.push({
        id: 'batch_processing',
        title: 'Enable Batch Processing',
        description: 'Process multiple assignments simultaneously to save time on large classes.',
        action: 'Learn More',
        icon: TrendingUp,
        color: 'green',
        priority: 'medium'
      });
    }

    // Integration suggestions
    if (completedReports.length > 5) {
      suggestions.push({
        id: 'lms_integration',
        title: 'Connect Your LMS',
        description: 'Integrate with Canvas, Blackboard, or Moodle for seamless workflow.',
        action: 'View Integrations',
        actionUrl: '/settings/integrations',
        icon: Settings,
        color: 'blue',
        priority: 'medium'
      });
    }

    // Student communication
    const needsReviewCount = completedReports.filter(r => 
      (r.ai_probability || 0) > 0.4 || (r.plagiarism_score || 0) > 0.3
    ).length;
    
    if (needsReviewCount > 3) {
      suggestions.push({
        id: 'student_communication',
        title: 'Improve Student Communication',
        description: `${needsReviewCount} assignments need discussion. Set up automated feedback templates.`,
        action: 'Create Templates',
        icon: Users,
        color: 'indigo',
        priority: 'medium'
      });
    }

    return suggestions.filter(s => !dismissed.has(s.id));
  };

  const handleDismiss = (suggestionId) => {
    setDismissed(prev => new Set([...prev, suggestionId]));
  };

  const suggestions = generateSuggestions();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Improvement Suggestions
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Personalized recommendations based on your usage patterns
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {suggestions.map((suggestion) => {
          const SuggestionIcon = suggestion.icon;
          
          return (
            <div key={suggestion.id} className="px-6 py-4 relative">
              <button
                onClick={() => handleDismiss(suggestion.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex items-start space-x-4 pr-8">
                <div className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  suggestion.color === 'blue' && "bg-blue-100 text-blue-600",
                  suggestion.color === 'purple' && "bg-purple-100 text-purple-600",
                  suggestion.color === 'orange' && "bg-orange-100 text-orange-600",
                  suggestion.color === 'green' && "bg-green-100 text-green-600",
                  suggestion.color === 'indigo' && "bg-indigo-100 text-indigo-600"
                )}>
                  <SuggestionIcon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {suggestion.title}
                    </h4>
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full",
                      suggestion.priority === 'high' && "bg-red-100 text-red-700",
                      suggestion.priority === 'medium' && "bg-yellow-100 text-yellow-700",
                      suggestion.priority === 'low' && "bg-green-100 text-green-700"
                    )}>
                      {suggestion.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {suggestion.description}
                  </p>
                  
                  <button
                    onClick={() => {
                      if (suggestion.actionUrl) {
                        // In a real app, you'd use router navigation
                        console.log('Navigate to:', suggestion.actionUrl);
                      } else {
                        console.log('Action:', suggestion.action);
                      }
                    }}
                    className={cn(
                      "inline-flex items-center text-sm font-medium rounded-md px-3 py-1.5 transition-colors",
                      suggestion.color === 'blue' && "text-blue-700 bg-blue-100 hover:bg-blue-200",
                      suggestion.color === 'purple' && "text-purple-700 bg-purple-100 hover:bg-purple-200",
                      suggestion.color === 'orange' && "text-orange-700 bg-orange-100 hover:bg-orange-200",
                      suggestion.color === 'green' && "text-green-700 bg-green-100 hover:bg-green-200",
                      suggestion.color === 'indigo' && "text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    )}
                  >
                    {suggestion.action}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 These suggestions are based on your usage patterns and industry best practices.
          Dismiss suggestions that don't apply to your workflow.
        </p>
      </div>
    </div>
  );
};

export default ImprovementSuggestions;