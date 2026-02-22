// @ts-nocheck
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Calendar } from 'lucide-react';

const ActivityCalendar = ({ activity, currentStreak, totalActiveDays }) => {
    const { t } = useTranslation();
    const locale = t('common.locale') === 'en' ? 'en-US' : 'fr-FR';

    const { cells, monthLabels } = useMemo(() => {
        // Map activity data by date
        const activityMap = new Map();
        activity.forEach(a => activityMap.set(a.date, a.count));

        // Generate last 365 days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start from the most recent Sunday that is >= 364 days ago
        const start = new Date(today);
        start.setDate(start.getDate() - 364);
        // Align to previous Sunday (start of week)
        const dayOfWeek = start.getDay();
        if (dayOfWeek !== 0) {
            start.setDate(start.getDate() - dayOfWeek);
        }

        const days = [];
        const current = new Date(start);
        while (current <= today) {
            const dateStr = current.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                count: activityMap.get(dateStr) || 0,
                dayOfWeek: current.getDay(),
                month: current.getMonth(),
                year: current.getFullYear(),
                dayOfMonth: current.getDate()
            });
            current.setDate(current.getDate() + 1);
        }

        // Build month labels from the weeks
        const months = [];
        let lastMonth = -1;
        let colIndex = 0;
        for (let i = 0; i < days.length; i++) {
            if (days[i].dayOfWeek === 0) {
                if (days[i].month !== lastMonth) {
                    months.push({
                        month: days[i].month,
                        col: colIndex,
                        label: new Date(days[i].year, days[i].month).toLocaleDateString(locale, { month: 'short' })
                    });
                    lastMonth = days[i].month;
                }
                colIndex++;
            }
        }

        return { cells: days, monthLabels: months };
    }, [activity, locale]);

    const getColor = (count) => {
        if (count === 0) return 'bg-gray-100';
        if (count === 1) return 'bg-green-200';
        if (count === 2) return 'bg-green-400';
        return 'bg-green-600';
    };

    const getTooltip = (cell) => {
        const dateFormatted = new Date(cell.date).toLocaleDateString(locale, {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        return cell.count === 0
            ? `${dateFormatted} : ${t('evolution.calendar.noSession')}`
            : `${dateFormatted} : ${cell.count} session${cell.count > 1 ? 's' : ''}`;
    };

    const dayLabels = locale.startsWith('en')
        ? ['', 'Mon', '', 'Wed', '', 'Fri', '']
        : ['', 'Lun', '', 'Mer', '', 'Ven', ''];

    // Group cells into columns (weeks), each column has 7 rows (Sun=0 to Sat=6)
    const weeks = [];
    let currentWeek = new Array(7).fill(null);
    for (const cell of cells) {
        currentWeek[cell.dayOfWeek] = cell;
        if (cell.dayOfWeek === 6) {
            weeks.push(currentWeek);
            currentWeek = new Array(7).fill(null);
        }
    }
    // Push remaining partial week
    if (currentWeek.some(c => c !== null)) {
        weeks.push(currentWeek);
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-lg font-bold text-gray-800">{t('evolution.calendar.title')}</h2>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-bold text-gray-700">
                            {t('evolution.calendar.streak', { count: currentStreak })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-bold text-gray-700">
                            {t('evolution.calendar.totalDays', { count: totalActiveDays })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-flex flex-col gap-0.5 min-w-fit">
                    {/* Month labels */}
                    <div className="flex ml-8 mb-1">
                        {monthLabels.map((m, i) => (
                            <span
                                key={i}
                                className="text-xs text-gray-400 font-medium"
                                style={{
                                    position: 'relative',
                                    left: `${m.col * 14}px`,
                                    marginRight: i < monthLabels.length - 1
                                        ? `${(monthLabels[i + 1].col - m.col) * 14 - m.label.length * 6}px`
                                        : 0
                                }}
                            >
                                {m.label}
                            </span>
                        ))}
                    </div>

                    {/* Grid: day labels + cells */}
                    <div className="flex gap-0.5">
                        {/* Day labels column */}
                        <div className="flex flex-col gap-0.5 mr-1">
                            {dayLabels.map((label, i) => (
                                <div key={i} className="w-6 h-[12px] flex items-center justify-end">
                                    <span className="text-[10px] text-gray-400 font-medium leading-none">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Week columns */}
                        {weeks.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-0.5">
                                {week.map((cell, di) => (
                                    <div
                                        key={di}
                                        className={`w-[12px] h-[12px] rounded-sm ${cell ? getColor(cell.count) : 'bg-transparent'}`}
                                        title={cell ? getTooltip(cell) : ''}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-1 mt-2 ml-8">
                        <span className="text-[10px] text-gray-400 mr-1">{t('evolution.calendar.less')}</span>
                        <div className="w-[12px] h-[12px] rounded-sm bg-gray-100" />
                        <div className="w-[12px] h-[12px] rounded-sm bg-green-200" />
                        <div className="w-[12px] h-[12px] rounded-sm bg-green-400" />
                        <div className="w-[12px] h-[12px] rounded-sm bg-green-600" />
                        <span className="text-[10px] text-gray-400 ml-1">{t('evolution.calendar.more')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityCalendar;
