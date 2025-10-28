import React, { useState } from 'react';
import { 
  MessageSquare, 
  Flag, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  User,
  Mail,
  FileText,
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';

const QuickActions = ({ report, assignment, onAction }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const getRecommendedActions = () => {
    const aiRisk = report.ai_probability || 0;
    const plagiarismRisk = report.plagiarism_score || 0;
    
    const actions = [];
    
    if (aiRisk > 0.7 || plagiarismRisk > 0.5) {
      actions.push({
        id: 'flag_high_risk',
        label: 'Flag for Review',
        icon: Flag,
        color: 'red',
        priority: 'high',
        description: 'Mark assignment for immediate instructor review'
      });
      
      actions.push({
        id: 'schedule_meeting',
        label: 'Schedule Meeting',
        icon: User,
        color: 'orange',
        priority: 'high',
        description: 'Schedule discussion with student about academic integrity'
      });
    }
    
    if (plagiarismRisk > 0.3) {
      actions.push({
        id: 'request_citations',
        label: 'Request Citations',
        icon: FileText,
        color: 'blue',
        priority: 'medium',
        description: 'Ask student to provide proper citations for flagged content'
      });
    }
    
    if (aiRisk > 0.4) {
      actions.push({
        id: 'ai_policy_reminder',
        label: 'Send AI Policy',
        icon: Mail,
        color: 'purple',
        priority: 'medium',
        description: 'Send reminder about AI usage policies'
      });
    }
    
    if (aiRisk <= 0.4 && plagiarismRisk <= 0.3) {
      actions.push({
        id: 'approve_submission',
        label: 'Approve Submission',
        icon: CheckCircle,
        color: 'green',
        priority: 'low',
        description: 'Mark as reviewed and ready for grading'
      });
    }
    
    actions.push({
      id: 'add_feedback',
      label: 'Add Feedback',
      icon: MessageSquare,
      color: 'gray',
      priority: 'low',
      description: 'Add instructor notes or feedback'
    });
    
    return actions;
  };

  const handleActionClick = (action) => {
    if (action.id === 'add_feedback') {
      setShowNotes(true);
      setSelectedAction(action.id);
    } else {
      setSelectedAction(action.id);
      if (onAction) {
        onAction(action.id, { notes, assignment, report });
      }
    }
  };

  const handleSubmitNotes = () => {
    if (onAction) {
      onAction(selectedAction, { notes, assignment, report });
    }
    setShowNotes(false);
    setNotes('');
    setSelectedAction('');
  };

  const actions = getRecommendedActions();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <Star className="h-4 w-4 mr-2" />
          Quick Actions
        </h4>
        <span className="text-xs text-gray-500">
          Based on analysis results
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => {
          const ActionIcon = action.icon;
          const isSelected = selectedAction === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={isSelected && action.id !== 'add_feedback'}
              className={cn(
                "flex items-start p-3 rounded-lg border transition-all duration-200 text-left",
                isSelected && action.id !== 'add_feedback' && "opacity-50 cursor-not-allowed",
                action.color === 'red' && "border-red-200 bg-red-50 hover:bg-red-100",
                action.color === 'orange' && "border-orange-200 bg-orange-50 hover:bg-orange-100",
                action.color === 'blue' && "border-blue-200 bg-blue-50 hover:bg-blue-100",
                action.color === 'purple' && "border-purple-200 bg-purple-50 hover:bg-purple-100",
                action.color === 'green' && "border-green-200 bg-green-50 hover:bg-green-100",
                action.color === 'gray' && "border-gray-200 bg-gray-50 hover:bg-gray-100"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-md mr-3 flex-shrink-0",
                action.color === 'red' && "bg-red-100 text-red-600",
                action.color === 'orange' && "bg-orange-100 text-orange-600",
                action.color === 'blue' && "bg-blue-100 text-blue-600",
                action.color === 'purple' && "bg-purple-100 text-purple-600",
                action.color === 'green' && "bg-green-100 text-green-600",
                action.color === 'gray' && "bg-gray-100 text-gray-600"
              )}>
                <ActionIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-sm font-medium",
                    action.color === 'red' && "text-red-800",
                    action.color === 'orange' && "text-orange-800",
                    action.color === 'blue' && "text-blue-800",
                    action.color === 'purple' && "text-purple-800",
                    action.color === 'green' && "text-green-800",
                    action.color === 'gray' && "text-gray-800"
                  )}>
                    {action.label}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    action.priority === 'high' && "bg-red-100 text-red-700",
                    action.priority === 'medium' && "bg-yellow-100 text-yellow-700",
                    action.priority === 'low' && "bg-green-100 text-green-700"
                  )}>
                    {action.priority}
                  </span>
                </div>
                <p className={cn(
                  "text-xs",
                  action.color === 'red' && "text-red-700",
                  action.color === 'orange' && "text-orange-700",
                  action.color === 'blue' && "text-blue-700",
                  action.color === 'purple' && "text-purple-700",
                  action.color === 'green' && "text-green-700",
                  action.color === 'gray' && "text-gray-700"
                )}>
                  {action.description}
                </p>
                {isSelected && action.id !== 'add_feedback' && (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Action completed
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Notes Modal */}
      {showNotes && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Feedback or Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your feedback, concerns, or notes about this submission..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNotes(false);
                  setNotes('');
                  setSelectedAction('');
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitNotes}
                disabled={!notes.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action History */}
      <div className="border-t border-gray-200 pt-3">
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Tip:</strong> Actions are automatically logged for audit purposes</p>
          <p>📧 Students will be notified of relevant actions via email</p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;