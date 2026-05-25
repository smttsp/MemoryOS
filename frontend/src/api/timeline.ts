import { api } from './client'
import type { TimelineDaySummary, Entry } from '../types'

export const getMonthSummary = (year: number, month: number) =>
  api.get<TimelineDaySummary[]>('/timeline/month', { params: { year, month } }).then(r => r.data)

export const getDayEntries = (date: string) =>
  api.get<Entry[]>('/timeline/day', { params: { date } }).then(r => r.data)
