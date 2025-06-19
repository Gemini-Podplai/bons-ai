/**
 * Production Monitoring System
 * Tracks performance, errors, and usage patterns for optimization
 */

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  type: 'response_time' | 'studio_switch' | 'ai_model_response' | 'error_rate' | 'uptime';
  value: number;
  metadata?: Record<string, any>;
  source: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: {
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=';
    threshold: number;
    duration: number; // seconds
  };
  actions: AlertAction[];
  enabled: boolean;
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'emergency_brake';
  config: Record<string, any>;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: ServiceHealth[];
  metrics: {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    activeUsers: number;
    costPerHour: number;
  };
  alerts: Alert[];
  lastUpdated: Date;
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  source: string;
  timestamp: Date;
  resolved: boolean;
}

export class ProductionMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private isMonitoring = false;

  constructor() {
    this.setupDefaultAlertRules();
  }

  private setupDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-response-time',
        name: 'High Response Time',
        condition: {
          metric: 'response_time',
          operator: '>',
          threshold: 5000, // 5 seconds
          duration: 60    // 1 minute
        },
        actions: [
          { type: 'webhook', config: { url: process.env.SLACK_WEBHOOK } }
        ],
        enabled: true
      },
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: {
          metric: 'error_rate',
          operator: '>',
          threshold: 5, // 5%
          duration: 300 // 5 minutes
        },
        actions: [
          { type: 'emergency_brake', config: {} },
          { type: 'webhook', config: { url: process.env.SLACK_WEBHOOK } }
        ],
        enabled: true
      },
      {
        id: 'cost-spike',
        name: 'Cost Spike',
        condition: {
          metric: 'cost_per_hour',
          operator: '>',
          threshold: 50, // $50/hour
          duration: 60   // 1 minute
        },
        actions: [
          { type: 'emergency_brake', config: {} },
          { type: 'webhook', config: { url: process.env.SLACK_WEBHOOK } }
        ],
        enabled: true
      }
    ];
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Production monitoring started');

    // Performance monitoring
    setInterval(() => this.collectPerformanceMetrics(), 30000); // Every 30 seconds
    
    // Service health checks
    setInterval(() => this.performHealthChecks(), 60000); // Every minute
    
    // Alert rule evaluation
    setInterval(() => this.evaluateAlertRules(), 10000); // Every 10 seconds
    
    // Cleanup old metrics
    setInterval(() => this.cleanupOldMetrics(), 3600000); // Every hour
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('⏹️ Production monitoring stopped');
  }

  private async collectPerformanceMetrics(): Promise<void> {
    try {
      // Collect response time metrics
      const responseTimeMetric = await this.measureAverageResponseTime();
      this.addMetric(responseTimeMetric);

      // Collect error rate metrics
      const errorRateMetric = await this.calculateErrorRate();
      this.addMetric(errorRateMetric);

      // Collect cost metrics
      const costMetric = await this.calculateCostPerHour();
      this.addMetric(costMetric);

      // Collect usage metrics
      const usageMetric = await this.collectUsageMetrics();
      this.addMetric(usageMetric);

    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
    }
  }

  private async measureAverageResponseTime(): Promise<PerformanceMetric> {
    const start = performance.now();
    
    try {
      // Test AI response time
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '🔍 Health check', studio: 'research' })
      });
      
      const duration = performance.now() - start;
      
      return {
        id: `response-time-${Date.now()}`,
        timestamp: new Date(),
        type: 'response_time',
        value: duration,
        source: 'ai-router',
        metadata: { healthCheck: true }
      };
    } catch (error) {
      return {
        id: `response-time-error-${Date.now()}`,
        timestamp: new Date(),
        type: 'response_time',
        value: -1,
        source: 'ai-router',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async calculateErrorRate(): Promise<PerformanceMetric> {
    // Calculate error rate from recent metrics
    const recentMetrics = this.metrics.filter(
      m => m.timestamp > new Date(Date.now() - 300000) // Last 5 minutes
    );
    
    const errorCount = recentMetrics.filter(m => m.value === -1).length;
    const totalRequests = recentMetrics.length;
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

    return {
      id: `error-rate-${Date.now()}`,
      timestamp: new Date(),
      type: 'error_rate',
      value: errorRate,
      source: 'monitor',
      metadata: { errorCount, totalRequests }
    };
  }

  private async calculateCostPerHour(): Promise<PerformanceMetric> {
    try {
      const response = await fetch('/api/usage');
      const usage = await response.json();
      
      return {
        id: `cost-${Date.now()}`,
        timestamp: new Date(),
        type: 'response_time',
        value: usage.costPerHour || 0,
        source: 'cost-tracker',
        metadata: usage
      };
    } catch (error) {
      return {
        id: `cost-error-${Date.now()}`,
        timestamp: new Date(),
        type: 'response_time',
        value: 0,
        source: 'cost-tracker',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async collectUsageMetrics(): Promise<PerformanceMetric> {
    // This would collect real usage data in production
    return {
      id: `usage-${Date.now()}`,
      timestamp: new Date(),
      type: 'response_time',
      value: Math.floor(Math.random() * 100), // Mock active users
      source: 'usage-tracker',
      metadata: { 
        studioSwitches: Math.floor(Math.random() * 50),
        aiRequests: Math.floor(Math.random() * 200)
      }
    };
  }

  private async performHealthChecks(): Promise<void> {
    const services = [
      'google-ai',
      'vertex-ai',
      'openrouter',
      'deepseek',
      'scrapybara',
      'cursor',
      'penpot',
      'copycapy',
      'github',
      'pipedream'
    ];

    for (const service of services) {
      try {
        const start = performance.now();
        const response = await fetch(`/api/${service}/health`, { 
          method: 'GET',
          timeout: 5000 
        } as any);
        
        const duration = performance.now() - start;
        const isHealthy = response.ok;

        this.addMetric({
          id: `health-${service}-${Date.now()}`,
          timestamp: new Date(),
          type: 'response_time',
          value: isHealthy ? duration : -1,
          source: service,
          metadata: { 
            healthy: isHealthy,
            status: response.status
          }
        });

      } catch (error) {
        this.addMetric({
          id: `health-${service}-error-${Date.now()}`,
          timestamp: new Date(),
          type: 'response_time',
          value: -1,
          source: service,
          metadata: { 
            healthy: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private evaluateAlertRules(): void {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      const recentMetrics = this.metrics.filter(
        m => m.type === rule.condition.metric as any &&
             m.timestamp > new Date(Date.now() - rule.condition.duration * 1000)
      );

      if (recentMetrics.length === 0) continue;

      const avgValue = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
      const shouldAlert = this.evaluateCondition(avgValue, rule.condition);

      if (shouldAlert) {
        this.triggerAlert(rule, avgValue, recentMetrics);
      }
    }
  }

  private evaluateCondition(value: number, condition: AlertRule['condition']): boolean {
    switch (condition.operator) {
      case '>': return value > condition.threshold;
      case '<': return value < condition.threshold;
      case '>=': return value >= condition.threshold;
      case '<=': return value <= condition.threshold;
      case '=': return value === condition.threshold;
      default: return false;
    }
  }

  private async triggerAlert(rule: AlertRule, value: number, metrics: PerformanceMetric[]): Promise<void> {
    const alert: Alert = {
      id: `alert-${rule.id}-${Date.now()}`,
      level: value > rule.condition.threshold * 2 ? 'critical' : 'warning',
      message: `${rule.name}: ${rule.condition.metric} is ${value.toFixed(2)} (threshold: ${rule.condition.threshold})`,
      source: rule.id,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(alert);
    console.warn('🚨 Alert triggered:', alert.message);

    // Execute alert actions
    for (const action of rule.actions) {
      try {
        await this.executeAlertAction(action, alert, value);
      } catch (error) {
        console.error('Failed to execute alert action:', error);
      }
    }
  }

  private async executeAlertAction(action: AlertAction, alert: Alert, value: number): Promise<void> {
    switch (action.type) {
      case 'webhook':
        if (action.config.url) {
          await fetch(action.config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `🚨 Bons-Ai Alert: ${alert.message}`,
              alert,
              value
            })
          });
        }
        break;

      case 'emergency_brake':
        await fetch('/api/emergency-brake', { method: 'POST' });
        console.log('🛑 Emergency brake activated due to alert');
        break;

      case 'email':
        // Email implementation would go here
        console.log('📧 Email alert would be sent:', alert.message);
        break;
    }
  }

  private cleanupOldMetrics(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
    
    console.log(`🧹 Cleaned up old metrics. Current count: ${this.metrics.length} metrics, ${this.alerts.length} alerts`);
  }

  getSystemHealth(): SystemHealth {
    const recentMetrics = this.metrics.filter(
      m => m.timestamp > new Date(Date.now() - 300000) // Last 5 minutes
    );

    const responseTimeMetrics = recentMetrics.filter(m => m.type === 'response_time' && m.value > 0);
    const averageResponseTime = responseTimeMetrics.length > 0 
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length 
      : 0;

    const errorMetrics = recentMetrics.filter(m => m.value === -1);
    const errorRate = recentMetrics.length > 0 
      ? (errorMetrics.length / recentMetrics.length) * 100 
      : 0;

    const uptime = this.calculateUptime();
    const activeAlerts = this.alerts.filter(a => !a.resolved);

    let overall: SystemHealth['overall'] = 'healthy';
    if (errorRate > 10 || averageResponseTime > 10000 || activeAlerts.some(a => a.level === 'critical')) {
      overall = 'critical';
    } else if (errorRate > 5 || averageResponseTime > 5000 || activeAlerts.some(a => a.level === 'warning')) {
      overall = 'warning';
    }

    return {
      overall,
      services: this.getServiceHealthSummary(),
      metrics: {
        averageResponseTime,
        errorRate,
        uptime,
        activeUsers: Math.floor(Math.random() * 100), // Mock data
        costPerHour: this.getLatestCostMetric()
      },
      alerts: activeAlerts,
      lastUpdated: new Date()
    };
  }

  private getServiceHealthSummary(): ServiceHealth[] {
    const services = ['google-ai', 'vertex-ai', 'openrouter', 'deepseek', 'scrapybara'];
    return services.map(service => {
      const recentMetrics = this.metrics
        .filter(m => m.source === service && m.timestamp > new Date(Date.now() - 300000))
        .slice(-10);

      const healthyMetrics = recentMetrics.filter(m => m.value > 0);
      const avgResponseTime = healthyMetrics.length > 0
        ? healthyMetrics.reduce((sum, m) => sum + m.value, 0) / healthyMetrics.length
        : 0;

      const errorRate = recentMetrics.length > 0
        ? ((recentMetrics.length - healthyMetrics.length) / recentMetrics.length) * 100
        : 0;

      let status: ServiceHealth['status'] = 'up';
      if (errorRate > 50) status = 'down';
      else if (errorRate > 20 || avgResponseTime > 5000) status = 'degraded';

      return {
        name: service,
        status,
        responseTime: avgResponseTime,
        errorRate,
        lastCheck: recentMetrics.length > 0 ? recentMetrics[recentMetrics.length - 1].timestamp : new Date()
      };
    });
  }

  private calculateUptime(): number {
    // Simplified uptime calculation - in production this would be more sophisticated
    const uptimeMetrics = this.metrics.filter(
      m => m.timestamp > new Date(Date.now() - 86400000) // Last 24 hours
    );
    
    const healthyMetrics = uptimeMetrics.filter(m => m.value > 0);
    return uptimeMetrics.length > 0 ? (healthyMetrics.length / uptimeMetrics.length) * 100 : 100;
  }

  private getLatestCostMetric(): number {
    const costMetrics = this.metrics
      .filter(m => m.source === 'cost-tracker')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return costMetrics.length > 0 ? costMetrics[0].value : 0;
  }

  getMetrics(type?: PerformanceMetric['type'], limit = 100): PerformanceMetric[] {
    let filtered = type ? this.metrics.filter(m => m.type === type) : this.metrics;
    return filtered.slice(-limit);
  }

  getAlerts(resolved = false): Alert[] {
    return this.alerts.filter(a => a.resolved === resolved);
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log('✅ Alert resolved:', alert.message);
    }
  }
}