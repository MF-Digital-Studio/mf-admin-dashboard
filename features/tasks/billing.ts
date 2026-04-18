import type { TaskBillingState, TaskStatus } from '@prisma/client'

export function resolveTaskBillingState(args: {
  status: TaskStatus
  price: number | null
  currentState?: TaskBillingState
}): TaskBillingState {
  const hasPrice = args.price !== null && args.price > 0

  if (!hasPrice) {
    return 'PENDING'
  }

  if (args.currentState === 'BILLED') {
    // Keep billed tasks billed to avoid re-billing historical work by accident.
    return 'BILLED'
  }

  if (args.status === 'DONE') {
    return 'READY_TO_BILL'
  }

  return 'PENDING'
}

