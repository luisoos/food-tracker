'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale/de';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

export function DatePicker() {
    const [date, setDate] = React.useState<Date | undefined>(undefined);

    React.useEffect(() => {
        setDate(new Date());
    }, []);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-auto justify-start text-left font-normal cursor-pointer',
                        !date && 'text-muted-foreground',
                    )}>
                    <CalendarIcon />
                    {date ? (
                        format(date, 'PPP', { locale: de })
                    ) : (
                        <span>Wähle ein Datum aus</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
                <Calendar
                    mode='single'
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
