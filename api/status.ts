import { getAutomationState } from '../src/server/automationEngine';

export default function handler(req: any, res: any) {
  return res.status(200).json({
    success: true,
    data: getAutomationState(),
  });
}
