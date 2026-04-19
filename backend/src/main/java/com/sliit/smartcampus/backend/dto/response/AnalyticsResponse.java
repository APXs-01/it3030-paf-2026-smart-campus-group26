package com.sliit.smartcampus.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnalyticsResponse {

    private long totalBookings;
    private long approved;
    private long pending;
    private long rejected;
    private long cancelled;
    private long checkedIn;

    private List<ResourceStat> topResources;
    private List<HourStat> peakHours;
    private List<DayStat> last7Days;

    @Data
    @Builder
    public static class ResourceStat {
        private Long resourceId;
        private String resourceName;
        private String location;
        private long count;
    }

    @Data
    @Builder
    public static class HourStat {
        private int hour;
        private String label;   // "09:00", "14:00" etc.
        private long count;
    }

    @Data
    @Builder
    public static class DayStat {
        private String date;    // "Mon 14 Apr"
        private long count;
    }
}
