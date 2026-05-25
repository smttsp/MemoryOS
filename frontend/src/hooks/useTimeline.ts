import { useQuery } from '@tanstack/react-query'
import * as timelineApi from '../api/timeline'

export const useMonthSummary = (year: number, month: number) =>
  useQuery({
    queryKey: ['timeline', 'month', year, month],
    queryFn: () => timelineApi.getMonthSummary(year, month),
  })

export const useDayEntries = (date: string) =>
  useQuery({
    queryKey: ['timeline', 'day', date],
    queryFn: () => timelineApi.getDayEntries(date),
    enabled: !!date,
  })

export const useRangeEntries = (start: string, end: string) =>
  useQuery({
    queryKey: ['timeline', 'range', start, end],
    queryFn: () => timelineApi.getRangeEntries(start, end),
    enabled: !!start && !!end,
  })
