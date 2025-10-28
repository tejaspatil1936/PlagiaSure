import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  Brain,
  Shield,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';

const ReportSummaryCard = ({ report }) => {
  const getOverallRisk = () => {
    const aiRisk = report.ai_probability || 0;
    const plagiarismRisk = report.plagiarism_score || 0;
    
    if (aiRisk > 0.7 || plagiarismRisk > 0.5) {
      return { level: 'HIGH', color: 'red', icon: AlertTriangle };
    }
    if (aiRisk > 0.4 || plagiarismRisk > 0.3) {
      return { level: 'MEDIUM', color: 'yellow', icon: Clock };
    }
    return { level: 'LOW', color: 'green', icon: CheckCircle };
  };

  const getVerdict = () => {
    const aiRisk = report.ai_probability || 0;
    const plagiarismRisk = report.plagiarism_score || 0;
    
    if (aiRisk > 0.8 && plagiarismRisk > 0.5) {
      return "High probability of AI-generated content with significant plagiarism detected.";
    }
    if (aiRisk > 0.7) {
      return "High probability of AI-generated content detected.";
    }
    if (plagiarismRisk > 0.5) {
      return "Significant plagiarism detected from multiple sources.";
    }
    if (aiRisk > 0.4 || plagiarismRisk > 0.3) {
      return "Moderate concerns detected. Manual review recommended.";
    }
    return "Content appears to be original with minimal concerns.";
  };

  const getActionItems = () => {
    const aiRisk = report.ai_probability || 0;
    const plagiarismRisk = report.plagiarism_score || 0;
    const actions = [];
    
    if (aiRisk > 0.7) {
      actions.push({
        priority: 'high',
        action: 'Discuss AI usage policy with student',
        icon: Brain
      });
    }
    
    if (plagiarismRisk > 0.5) {
      actions.push({
        priority: 'high',
        action: 'Review flagged passages with student',
        icon: FileText
      });
    }
    
    if (aiRisk > 0.4 || plagiarismRisk > 0.3) {
      actions.push({
        priority: 'medium',
        action: 'Conduct manual review of content',
        icon: Target
      });
    }
    
    if (actions.length === 0) {
      actions.push({
        priority: 'low',
        action: 'Proceed with standard grading',
        icon: CheckCircle
      });
    }
    
    return actions;
  };

  const risk = getOverallRisk();
  const RiskIcon = risk.icon;
  const actionItems = getActionItems();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with Overall Risk */}
      <div className={cn(
        "px-6 py-4 border-b",
        risk.color === 'red' && "bg-red-50 border-red-200",
        risk.color === 'yellow' && "bg-yellow-50 border-yellow-200",
        risk.color === 'green' && "bg-green-50 border-green-200"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg",
              risk.color === 'red' && "bg-red-100 text-red-600",
              risk.color === 'yellow' && "bg-yellow-100 text-yellow-600",
              risk.color === 'green' && "bg-green-100 text-green-600"
            )}>
              <RiskIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Analysis Summary
              </h3>
              <p className={cn(
                "text-sm font-medium",
                risk.color === 'red' && "text-red-700",
                risk.color === 'yellow' && "text-yellow-700",
                risk.color === 'green' && "text-green-700"
              )}>
                {risk.level} RISK DETECTED
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Score</div>
            <div className={cn(
              "text-2xl font-bold",
              risk.color === 'red' && "text-red-600",
              risk.color === 'yellow' && "text-yellow-600",
              risk.color === 'green' && "text-green-600"
            )}>
              {Math.max(
                (report.ai_probability || 0) * 100,
                (report.plagiarism_score || 0) * 100
              ).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* AI Detection */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-gray-900">AI Detection</h4>
              </div>
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                (report.ai_probability || 0) > 0.7 && "bg-red-100 text-red-700",
                (report.ai_probability || 0) > 0.4 && (report.ai_probability || 0) <= 0.7 && "bg-yellow-100 text-yellow-700",
                (report.ai_probability || 0) <= 0.4 && "bg-green-100 text-green-700"
              )}>
                {(report.ai_probability || 0) > 0.7 ? 'High' : 
                 (report.ai_probability || 0) > 0.4 ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {((report.ai_probability || 0) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-purple-700">
                  AI Probability
                </div>
              </div>
              <div className="text-right text-xs text-gray-600">
                <div>{report.ai_highlight?.filter(h => h.ai).length || 0} flagged sentences</div>
                <div>of {report.ai_highlight?.length || 0} analyzed</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(report.ai_probability || 0) * 100}%` }}
              />
            </div>
          </div>

          {/* Plagiarism Detection */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Plagiarism</h4>
              </div>
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                (report.plagiarism_score || 0) > 0.5 && "bg-red-100 text-red-700",
                (report.plagiarism_score || 0) > 0.3 && (report.plagiarism_score || 0) <= 0.5 && "bg-yellow-100 text-yellow-700",
                (report.plagiarism_score || 0) <= 0.3 && "bg-green-100 text-green-700"
              )}>
                {(report.plagiarism_score || 0) > 0.5 ? 'High' : 
                 (report.plagiarism_score || 0) > 0.3 ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {((report.plagiarism_score || 0) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-700">
                  Similarity Score
                </div>
              </div>
              <div className="text-right text-xs text-gray-600">
                <div>{report.plagiarism_highlight?.length || 0} matches found</div>
                <div>across {Array.from(new Set(report.plagiarism_highlight?.map(h => h.source) || [])).length} sources</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(report.plagiarism_score || 0) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className={cn(
          "p-4 rounded-lg border-l-4 mb-6",
          risk.color === 'red' && "bg-red-50 border-red-400",
          risk.color === 'yellow' && "bg-yellow-50 border-yellow-400",
          risk.color === 'green' && "bg-green-50 border-green-400"
        )}>
          <div className="flex items-start space-x-3">
            <Shield className={cn(
              "h-5 w-5 mt-0.5",
              risk.color === 'red' && "text-red-600",
              risk.color === 'yellow' && "text-yellow-600",
              risk.color === 'green' && "text-green-600"
            )} />
            <div>
              <h4 className={cn(
                "font-medium mb-1",
                risk.color === 'red' && "text-red-800",
                risk.color === 'yellow' && "text-yellow-800",
                risk.color === 'green' && "text-green-800"
              )}>
                Analysis Verdict
              </h4>
              <p className={cn(
                "text-sm",
                risk.color === 'red' && "text-red-700",
                risk.color === 'yellow' && "text-yellow-700",
                risk.color === 'green' && "text-green-700"
              )}>
                {getVerdict()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recommended Actions
          </h4>
          <div className="space-y-2">
            {actionItems.map((item, index) => {
              const ActionIcon = item.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={cn(
                    "p-1.5 rounded-full",
                    item.priority === 'high' && "bg-red-100 text-red-600",
                    item.priority === 'medium' && "bg-yellow-100 text-yellow-600",
                    item.priority === 'low' && "bg-green-100 text-green-600"
                  )}>
                    <ActionIcon className="h-3 w-3" />
                  </div>
                  <span className="text-sm text-gray-700 flex-1">{item.action}</span>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    item.priority === 'high' && "bg-red-100 text-red-700",
                    item.priority === 'medium' && "bg-yellow-100 text-yellow-700",
                    item.priority === 'low' && "bg-green-100 text-green-700"
                  )}>
                    {item.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSummaryCard;