import {
  type PatrolFrequency,
  type UniformBy,
  type CheckType,
  DEFAULT_COORDINATES,
  VALIDATION_ERRORS,
} from "../../../constants";
import {
  getCoordinatesFromData,
  getValidGuardTypeId,
  validateTimeFormat,
} from "../../../utils/transformations";

// Re-export for backward compatibility
export type PatrolFrequencyType = PatrolFrequency;
export type UniformProvider = UniformBy;
export type CheckpointType = CheckType;

export interface ClientSite {
  id: string;
  areaOfficerId: string;
  name: string;
  type: string | string[];
  contactPerson: {
    fullName: string;
    designation: string;
    phoneNumber: string;
    email: string;
  };
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    pincode: string;
    state: string;
    landmark?: string;
  };
  geoLocation: {
    mapLink?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    plusCode?: string;
  };
  geoFencing: {
    type: "Circular Geofence" | "Polygon Geofence" | "NO_GEOFENCE";
    radius?: number;
    coordinates?: Array<{ lat: number; lng: number }>;
  };
  patroling: {
    patrol: boolean;
    patrolRouteDetails: PatrolRouteDetail[];
  };
  sitePosts: SitePost[];
}

export interface PatrolRouteDetail {
  name: string;
  routeCode?: string;
  patrolFrequency: {
    type: "time" | "count";
    hours?: number;
    minutes?: number;
    count?: number;
    numberOfPatrols: number;
  };
  patrolCheckpoints: PatrolCheckpoint[];
}

export interface PatrolCheckpoint {
  type: "qr code" | "photo";
  qrCode?: string;
  photo?: string;
}

export interface SitePost {
  name: string;
  geoFenceType: "Circular Geofence" | "Polygon Geofence";
  geoFenceRadius?: number;
  geoFenceCoordinates?: Array<{ lat: number; lng: number }>;
  shifts: SitePostShift[];
}

export interface SitePostShift {
  days: string[];
  publicHolidayGuardRequired: boolean;
  dutyStartTime: string;
  dutyEndTime: string;
  checkInTime: string;
  latenessFrom: string;
  latenessTo: string;
  guardRequirements: GuardRequirement[];
  guardSelections?: APIGuardSelection[];
}

export interface GuardRequirement {
  guardTypeId: string; // Changed from guardType
  count: number;
  uniformBy: "client" | "PSA";
  uniformType: string;
  tasks: boolean;
  alertnessChallenge: boolean;
  alertnessChallengeOccurrence?: number;
  patrolEnabled: boolean;
  selectPatrolRoutes: string[];
}

export interface CreateSiteAPIRequest {
  clientId: string;
  siteId: string;
  areaOfficerId: string;
  siteName: string;
  siteType: string[];
  siteContactPersonFullName?: string;
  siteContactDesignation?: string;
  siteContactPhone?: string;
  siteContactEmail?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  pinCode: string;
  state: string;
  landMark?: string;
  siteLocationMapLink?: string;
  latitude?: number;
  longitude?: number;
  plusCode?: string;
  geofenceType: "CIRCLE" | "POLYGON" | "NO_GEOFENCE";
  geoFenceMapData?: {
    type: "circle" | "polygon";
    center?: { lat: number; lng: number };
    radius?: number;
    coordinates?: Array<{ lat: number; lng: number }>;
  };
  patrolling: boolean;
  patrolRoutes?: APIPatrolRoute[];
  sitePosts?: APISitePost[];
}

export interface APIPatrolRoute {
  routeName: string;
  patrolRouteCode?: string;
  patrolFrequency: "TIME" | "COUNT";
  hours?: number;
  minutes?: number;
  count?: number;
  roundsInShift?: number;
  checkpoints: APICheckpoint[];
}

export interface APICheckpoint {
  checkType: "QR_CODE" | "PHOTO";
  qrCodeUrl?: string;
  qrlocationImageUrl?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface APISitePost {
  postName: string;
  geofenceType: "CIRCLE" | "POLYGON";
  geoFenceMapData?: {
    type: "circle" | "polygon";
    center: { lat: number; lng: number };
    radius: number;
  };
  shifts: APIShift[];
}

export interface APIShift {
  daysOfWeek: string[];
  includePublicHolidays: boolean;
  dutyStartTime: string;
  dutyEndTime: string;
  checkInTime: string;
  latenessFrom: string;
  latenessTo: string;
  guardRequirements: APIGuardRequirement[];
  guardSelections?: APIGuardSelection[];
}

export interface APIGuardRequirement {
  guardTypeId: string; // Changed from guardType
  guardCount: number;
  uniformBy: "CLIENT" | "PSA";
  uniformType: string;
  tasksEnabled: boolean;
  alertnessChallengeEnabled: boolean;
  alertnessChallengeCount?: number;
  patrolEnabled: boolean;
  selectedPatrolRoutes: string[];
}

export interface APIGuardSelection {
  guardId: string;
  alertnessChallenge: boolean;
  occurenceCount?: number;
  patrolling: boolean;
}


export const transformClientSiteToAPI = (data: ClientSite, clientId: string): CreateSiteAPIRequest => {
  const coordinates = getCoordinatesFromData(data);
  return {
    clientId,
    siteId: data.id,
    areaOfficerId: data.areaOfficerId,
    siteName: data.name || "",
    siteType: Array.isArray(data.type) ? data.type.filter((t) => t) : data.type ? [data.type] : [],
    siteContactPersonFullName: data.contactPerson?.fullName || undefined,
    siteContactDesignation: data.contactPerson?.designation || undefined,
    siteContactPhone: data.contactPerson?.phoneNumber || undefined,
    siteContactEmail: data.contactPerson?.email || undefined,
    addressLine1: data.address?.addressLine1 || "",
    addressLine2: data.address?.addressLine2 || undefined,
    city: data.address?.city || "",
    district: data.address?.district || "",
    pinCode: data.address?.pincode || "",
    state: data.address?.state || "",
    landMark: data.address?.landmark || undefined,
    siteLocationMapLink: data.geoLocation?.mapLink || undefined,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    plusCode: data.geoLocation?.plusCode || undefined,
    geofenceType:
      data.geoFencing?.type === "Circular Geofence"
        ? "CIRCLE"
        : data.geoFencing?.type === "Polygon Geofence"
          ? "POLYGON"
          : "NO_GEOFENCE",
    geoFenceMapData: data.geoFencing?.type
      ? {
          type: data.geoFencing.type === "Circular Geofence" ? "circle" : "polygon",
          center: {
            lat: coordinates.latitude,
            lng: coordinates.longitude,
          },
          radius: data.geoFencing.type === "Circular Geofence" ? data.geoFencing.radius || 100 : undefined,
          coordinates: data.geoFencing.type === "Polygon Geofence" ? data.geoFencing.coordinates : undefined,
        }
      : undefined,
    patrolling: data.patroling?.patrol || false,
    patrolRoutes:
      data.patroling?.patrol && data.patroling?.patrolRouteDetails?.length
        ? data.patroling.patrolRouteDetails
            .filter((route) => route && route.name?.trim())
            .map((route) => {
              const frequency = route.patrolFrequency;
              const isTimeType = frequency?.type === "time";
              const isCountType = frequency?.type === "count";
              return {
                routeName: route.name.trim(),
                patrolRouteCode: route.routeCode?.trim() || undefined,
                patrolFrequency: (frequency?.type?.toUpperCase() as "TIME" | "COUNT") || "TIME",
                hours: isTimeType ? frequency.hours || 0 : undefined,
                minutes: isTimeType ? frequency.minutes || 0 : undefined,
                count: isCountType ? Math.max(1, frequency.count || 1) : undefined,
                roundsInShift: Math.max(1, frequency?.numberOfPatrols || 1),
                checkpoints: route.patrolCheckpoints?.length
                  ? route.patrolCheckpoints
                      .filter((checkpoint) => checkpoint && checkpoint.type)
                      .map((checkpoint) => ({
                        checkType: checkpoint.type === "qr code" ? "QR_CODE" : "PHOTO",
                        qrCodeUrl: checkpoint.type === "qr code" ? checkpoint.qrCode : undefined,
                        qrlocationImageUrl: checkpoint.type === "qr code" ? checkpoint.photo : undefined,
                        photoUrl: checkpoint.type === "photo" ? checkpoint.photo : undefined,
                        latitude: coordinates.latitude,
                        longitude: coordinates.longitude,
                      }))
                  : [],
              };
            })
        : [],
    sitePosts: data.sitePosts?.length
      ? data.sitePosts
          .filter((post) => post && post.name?.trim())
          .map((post) => ({
            postName: post.name.trim(),
            geofenceType: post.geoFenceType === "Circular Geofence" ? "CIRCLE" : "POLYGON",
            geoFenceMapData:
              post.geoFenceType === "Circular Geofence"
                ? {
                    type: "circle",
                    center: { lat: coordinates.latitude, lng: coordinates.longitude },
                    radius: post.geoFenceRadius ?? 25,
                  }
                : {
                    type: "polygon",
                    center: { lat: coordinates.latitude, lng: coordinates.longitude },
                    radius: 0,
                    coordinates: post.geoFenceCoordinates ?? [],
                  },
            shifts: post.shifts?.length
              ? post.shifts
                  .filter((shift) => shift && shift.days?.length)
                  .map((shift) => ({
                    daysOfWeek: shift.days.filter((day) => day),
                    includePublicHolidays: shift.publicHolidayGuardRequired || false,
                    dutyStartTime: validateTimeFormat(shift.dutyStartTime),
                    dutyEndTime: validateTimeFormat(shift.dutyEndTime),
                    checkInTime: validateTimeFormat(shift.checkInTime),
                    latenessFrom: validateTimeFormat(shift.latenessFrom),
                    latenessTo: validateTimeFormat(shift.latenessTo),
                    guardRequirements: shift.guardRequirements?.length
                      ? shift.guardRequirements
                          .filter((req) => req && req.guardTypeId && req.guardTypeId.trim() && req.count && req.count > 0)
                          .map((req) => ({
                            guardTypeId: getValidGuardTypeId(req.guardTypeId), // Use guardTypeId
                            guardCount: Math.max(1, req.count || 1),
                            uniformBy: (req.uniformBy?.toUpperCase() === "CLIENT" ? "CLIENT" : "PSA") as
                              | "CLIENT"
                              | "PSA",
                            uniformType: req.uniformType || "standard",
                            tasksEnabled: req.tasks !== false,
                            alertnessChallengeEnabled: req.alertnessChallenge || false,
                            alertnessChallengeCount: req.alertnessChallenge
                              ? Math.max(0, req.alertnessChallengeOccurrence || 0)
                              : undefined,
                            patrolEnabled: req.patrolEnabled || false,
                            selectedPatrolRoutes: Array.isArray(req.selectPatrolRoutes)
                              ? req.selectPatrolRoutes.filter(
                                  (route) => route && typeof route === "string" && route.trim()
                                )
                              : [],
                          }))
                      : [],
                    guardSelections: shift.guardSelections?.length
                      ? shift.guardSelections
                          .filter((selection) => selection && selection.guardId && selection.guardId.trim())
                          .map((selection) => ({
                            guardId: selection.guardId,
                            alertnessChallenge: selection.alertnessChallenge || false,
                            occurenceCount: selection.occurenceCount || 0,
                            patrolling: selection.patrolling || false,
                          }))
                      : undefined,
                  }))
              : [],
          }))
      : [],
  };
};

export const validatePatrolRouteData = (route: any): boolean => {
  if (!route || !route.name?.trim()) return false;
  if (!route.patrolFrequency || !route.patrolFrequency.type) return false;
  const freq = route.patrolFrequency;
  if (freq.type === "time") {
    const hasValidTime = (freq.hours && freq.hours > 0) || (freq.minutes && freq.minutes > 0);
    if (!hasValidTime) return false;
  } else if (freq.type === "count") {
    if (!freq.count || freq.count < 1) return false;
  }
  if (!freq.numberOfPatrols || freq.numberOfPatrols < 1) return false;
  if (route.patrolCheckpoints && route.patrolCheckpoints.length > 0) {
    return route.patrolCheckpoints.every(
      (checkpoint: any) =>
        checkpoint && checkpoint.type && (checkpoint.type === "qr code" || checkpoint.type === "photo")
    );
  }
  return true;
};

export const validateSitePostData = (post: any): boolean => {
  if (!post || !post.name?.trim()) return false;
  if (!post.shifts || post.shifts.length === 0) return false;
  return post.shifts.every((shift: any) => {
    if (!shift || !shift.days || shift.days.length === 0) return false;
    if (!shift.dutyStartTime || !shift.dutyEndTime) return false;
    if (!shift.guardRequirements || shift.guardRequirements.length === 0) return false;
    return shift.guardRequirements.every((req: any) => req && req.guardTypeId && req.count && req.count >= 1);
  });
};

export const validateClientSiteData = (data: ClientSite): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!data.name?.trim()) errors.push(VALIDATION_ERRORS.SITE_NAME_REQUIRED);
  if (!data.contactPerson?.fullName?.trim()) errors.push(VALIDATION_ERRORS.CONTACT_NAME_REQUIRED);
  if (!data.address?.addressLine1?.trim()) errors.push(VALIDATION_ERRORS.ADDRESS_REQUIRED);
  if (!data.address?.city?.trim()) errors.push(VALIDATION_ERRORS.CITY_REQUIRED);
  if (!data.address?.state?.trim()) errors.push(VALIDATION_ERRORS.STATE_REQUIRED);
  const lat = data.geoLocation?.coordinates?.latitude;
  const lng = data.geoLocation?.coordinates?.longitude;
  if (typeof lat !== "number" || isNaN(lat)) errors.push(VALIDATION_ERRORS.LATITUDE_REQUIRED);
  if (typeof lng !== "number" || isNaN(lng)) errors.push(VALIDATION_ERRORS.LONGITUDE_REQUIRED);
  if (!data.sitePosts?.length) {
    errors.push(VALIDATION_ERRORS.SITE_POST_REQUIRED);
  } else {
    data.sitePosts.forEach((post, postIndex) => {
      if (!validateSitePostData(post)) {
        errors.push(VALIDATION_ERRORS.SITE_POST_INVALID(postIndex));
      }
    });
  }
  if (data.patroling?.patrol && data.patroling?.patrolRouteDetails?.length) {
    data.patroling.patrolRouteDetails.forEach((route, routeIndex) => {
      if (!validatePatrolRouteData(route)) {
        errors.push(VALIDATION_ERRORS.PATROL_ROUTE_INVALID(routeIndex));
      }
    });
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};



export const safeTransformClientSiteToAPI = (
  data: ClientSite,
  clientId: string
): {
  success: boolean;
  data?: CreateSiteAPIRequest;
  errors?: string[];
} => {
  try {
    const validation = validateClientSiteData(data);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }
    if (!clientId?.trim()) {
      return {
        success: false,
        errors: ["Client ID is required"],
      };
    }
    const transformedData = transformClientSiteToAPI(data, clientId);
    if (transformedData.patrolRoutes && transformedData.patrolRoutes.length > 0) {
      for (const route of transformedData.patrolRoutes) {
        for (const checkpoint of route.checkpoints) {
          if (
            typeof checkpoint.latitude !== "number" ||
            typeof checkpoint.longitude !== "number" ||
            isNaN(checkpoint.latitude) ||
            isNaN(checkpoint.longitude)
          ) {
            return {
              success: false,
              errors: [
                `Invalid coordinates in patrol route "${route.routeName}": lat=${checkpoint.latitude}, lng=${checkpoint.longitude}`,
              ],
            };
          }
        }
      }
    }
    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error("Error transforming client site data:", error);
    return {
      success: false,
      errors: [`Transformation error: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
};

export interface SiteAPIResponse {
  id: string;
  clientId: string;
  siteName: string;
  siteType: string[];
  siteContactPersonFullName?: string;
  siteContactDesignation?: string;
  siteContactPhone?: string;
  siteContactEmail?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  pinCode: string;
  state: string;
  landMark?: string;
  siteLocationMapLink?: string;
  latitude?: string;
  longitude?: string;
  plusCode?: string;
  geoFenceMapData?: any;
  geofenceType: string;
  patrolling: boolean;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    clientName: string;
    clientLogo?: string;
  };
  PatrolRoutes: PatrolRouteResponse[];
  SitePost: SitePostResponse[];
}

export interface PatrolRouteResponse {
  id: string;
  siteId: string;
  routeName: string;
  patrolRouteCode?: string;
  patrolFrequency: string;
  hours?: number;
  minutes?: number;
  count?: number;
  roundsInShift?: number;
  createdAt: string;
  updatedAt: string;
  checkpoints: CheckpointResponse[];
}

export interface CheckpointResponse {
  id: string;
  patrolRouteId: string;
  checkType: string;
  qrCodeUrl?: string;
  qrlocationImageUrl?: string;
  photoUrl?: string;
  latitude?: string;
  longitude?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SitePostResponse {
  id: string;
  siteId: string;
  postName: string;
  geofenceType: string;
  geoFenceMapData?: any;
  createdAt: string;
  updatedAt: string;
  SitePostShift: SitePostShiftResponse[];
}

export interface SitePostShiftResponse {
  id: string;
  sitePostId: string;
  daysOfWeek: string[];
  includePublicHolidays: boolean;
  dutyStartTime: string;
  dutyEndTime: string;
  checkInTime: string;
  latenessFrom: string;
  latenessTo: string;
  createdAt: string;
  updatedAt: string;
  guardRequirements: GuardRequirementResponse[];
  GuardSelection: GuardSelectionResponse[];
}

export interface GuardRequirementResponse {
  id: string;
  sitePostShiftId: string;
  guardType: string;
  guardCount: number;
  uniformBy: string;
  uniformType: string;
  tasksEnabled: boolean;
  alertnessChallengeEnabled: boolean;
  alertnessChallengeCount?: number;
  patrolEnabled: boolean;
  selectedPatrolRoutes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GuardSelectionResponse {
  id: string;
  shiftPostId: string;
  guardId: string;
  alertnessChallenge: boolean;
  occurenceCount?: number;
  patrolling: boolean;
  createdAt: string;
  updatedAt: string;
  guardReference: {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    status: string;
  };
}

export interface SiteFormValidation {
  step1: {
    id: string;
    name: string;
    type: string;
    "contactPerson.fullName": string;
    "contactPerson.designation": string;
    "contactPerson.phoneNumber": string;
    "contactPerson.email": string;
    areaOfficer: string;
  };
  step2: {
    "address.addressLine1": string;
    "address.city": string;
    "address.district": string;
    "address.pincode": string;
    "address.state": string;
    "geoFencing.type": string;
  };
  step3: {
    sitePosts: SitePost[];
  };
  step4: {};
}

export const defaultClientSite: ClientSite = {
  id: "",
  areaOfficerId: "",
  name: "",
  type: "",
  contactPerson: {
    fullName: "",
    designation: "",
    phoneNumber: "",
    email: "",
  },
  address: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    pincode: "",
    state: "",
    landmark: "",
  },
  geoLocation: {
    mapLink: "",
    coordinates: {
      latitude: DEFAULT_COORDINATES.latitude,
      longitude: DEFAULT_COORDINATES.longitude,
    },
    plusCode: "",
  },
  geoFencing: {
    type: "Circular Geofence",
    radius: 100,
    coordinates: [],
  },
  patroling: {
    patrol: false,
    patrolRouteDetails: [],
  },
  sitePosts: [],
};

export const defaultSitePost: SitePost = {
  name: "",
  geoFenceType: "Circular Geofence",
  geoFenceRadius: 25,
  geoFenceCoordinates: [],
  shifts: [],
};

export const defaultSitePostShift: SitePostShift = {
  days: [],
  publicHolidayGuardRequired: false,
  dutyStartTime: "00:00",
  dutyEndTime: "00:00",
  checkInTime: "00:00",
  latenessFrom: "00:00",
  latenessTo: "00:00",
  guardRequirements: [],
};

export const defaultGuardRequirement: GuardRequirement = {
  guardTypeId: "", // Changed from guardType
  count: 1,
  uniformBy: "PSA",
  uniformType: "standard",
  tasks: true,
  alertnessChallenge: false,
  alertnessChallengeOccurrence: 0,
  patrolEnabled: false,
  selectPatrolRoutes: [],
};

export const defaultPatrolRouteDetail: PatrolRouteDetail = {
  name: "",
  routeCode: "",
  patrolFrequency: {
    type: "time",
    hours: 1,
    minutes: 0,
    count: 0,
    numberOfPatrols: 1,
  },
  patrolCheckpoints: [],
};

export const defaultPatrolCheckpoint: PatrolCheckpoint = {
  type: "qr code",
  qrCode: "",
  photo: "",
};
