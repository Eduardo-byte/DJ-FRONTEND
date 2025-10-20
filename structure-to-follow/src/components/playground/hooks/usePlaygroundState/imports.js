import { useState, useMemo, useContext, useEffect, useRef } from "react";
import { aiModels, aiGoals } from "../../utils/configData";
import { UserDataContext } from "../../../../context/UserDataContext";
import {
  findMatchingGoalKey,
  normalizeGoalString,
  findMatchingModelKey,
  normalizeModelString
} from "../../../../utils/formatUtils";
import { chatService } from "../../../../api/services/chat.service";
import { webScraperService } from "../../../../api/services/webscraper.service";
import { setValueAtPath } from "../../../../utils/chatUtils";
import { supabase } from "../../../../lib/supabase";
