import { createSupabaseClient } from './client';
import { ScanResults } from '@/lib/scanner-logic';

export interface ScanRecord {
  id: string;
  user_id: string;
  input_text: string;
  risk_score: number;
  findings: {
    critical: any[];
    warnings: any[];
    minor: any[];
  };
  summary: {
    totalFindings: number;
    uniqueTerms: number;
    estimatedPenalty: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Serializes findings to remove any non-serializable properties (like RegExp instances)
 */
function serializeFindings(findings: ScanResults['findings']) {
  return {
    critical: findings.critical.map(match => ({
      term: {
        term: match.term.term,
        regex: match.term.regex, // Keep as string, not RegExp
        language: match.term.language,
        category: match.term.category,
        regulation: match.term.regulation,
        penaltyRange: match.term.penaltyRange,
        description: match.term.description,
        alternatives: match.term.alternatives,
        severity: match.term.severity,
      },
      matchText: match.matchText,
      position: match.position,
      lineNumber: match.lineNumber,
      context: match.context,
    })),
    warnings: findings.warnings.map(match => ({
      term: {
        term: match.term.term,
        regex: match.term.regex,
        language: match.term.language,
        category: match.term.category,
        regulation: match.term.regulation,
        penaltyRange: match.term.penaltyRange,
        description: match.term.description,
        alternatives: match.term.alternatives,
        severity: match.term.severity,
      },
      matchText: match.matchText,
      position: match.position,
      lineNumber: match.lineNumber,
      context: match.context,
    })),
    minor: findings.minor.map(match => ({
      term: {
        term: match.term.term,
        regex: match.term.regex,
        language: match.term.language,
        category: match.term.category,
        regulation: match.term.regulation,
        penaltyRange: match.term.penaltyRange,
        description: match.term.description,
        alternatives: match.term.alternatives,
        severity: match.term.severity,
      },
      matchText: match.matchText,
      position: match.position,
      lineNumber: match.lineNumber,
      context: match.context,
    })),
  };
}

/**
 * Saves a scan result to the database
 * @param userId - The user's ID
 * @param scanResults - The scan results to save
 * @returns The saved scan record or error
 */
export async function saveScan(
  userId: string,
  scanResults: ScanResults
) {
  const supabase = createSupabaseClient();
  
  try {
    // Truncate input text if too long (PostgreSQL text limit is ~1GB, but we'll limit to 1MB for safety)
    const maxTextLength = 1024 * 1024; // 1MB
    const inputText = scanResults.inputText.length > maxTextLength
      ? scanResults.inputText.substring(0, maxTextLength)
      : scanResults.inputText;
    
    // Serialize findings to ensure all data is JSON-serializable
    const serializedFindings = serializeFindings(scanResults.findings);
    
    // Build insert object
    const insertData: any = {
      user_id: userId,
      input_text: inputText,
      risk_score: scanResults.riskScore,
      findings: serializedFindings,
      summary: scanResults.summary,
    };
    
    let { data, error } = await supabase
      .from('scans')
      .insert(insertData)
      .select()
      .single();
    
    // If error is about missing summary column, try without it and embed in findings
    if (error && (error.message?.includes("summary") || error.message?.includes("column"))) {
      console.warn('Summary column not found, embedding summary in findings metadata');
      
      // Embed summary in findings as metadata
      const findingsWithSummary = {
        ...serializedFindings,
        _metadata: {
          summary: scanResults.summary,
        },
      };
      
      // Try again without summary column
      const insertDataWithoutSummary = {
        user_id: userId,
        input_text: inputText,
        risk_score: scanResults.riskScore,
        findings: findingsWithSummary,
      };
      
      const retryResult = await supabase
        .from('scans')
        .insert(insertDataWithoutSummary)
        .select()
        .single();
      
      data = retryResult.data;
      error = retryResult.error;
    }
    
    if (error) {
      console.error('Supabase error saving scan:', error);
      
      // Provide more specific error messages
      if (error.code === '23505') {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: 'Duplicate scan detected. This scan may have already been saved.' 
          } 
        };
      }
      
      if (error.code === '42P01') {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: 'Database table "scans" does not exist. Please contact support.' 
          } 
        };
      }
      
      // Check for column not found errors
      if (error.message?.includes("column") || error.message?.includes("not found")) {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: 'Database schema mismatch. Please run migrations or contact support.' 
          } 
        };
      }
      
      return { data, error };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Unexpected error saving scan:', error);
    return { 
      data: null, 
      error: { 
        message: error.message || 'Failed to save scan to database',
        details: error.toString()
      } 
    };
  }
}

/**
 * Gets all scans for a user
 * @param userId - The user's ID
 * @returns Array of scan records or error
 */
export async function getUserScans(userId: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
}

/**
 * Gets a single scan by ID
 * @param scanId - The scan ID
 * @param userId - The user's ID (for security)
 * @returns The scan record or error
 */
export async function getScanById(scanId: string, userId: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .eq('user_id', userId)
    .single();
  
  return { data, error };
}

/**
 * Deletes a scan
 * @param scanId - The scan ID
 * @param userId - The user's ID (for security)
 * @returns Success or error
 */
export async function deleteScan(scanId: string, userId: string) {
  const supabase = createSupabaseClient();
  
  // First verify the scan exists and belongs to the user
  const { data: existingScan, error: fetchError } = await supabase
    .from('scans')
    .select('id, user_id')
    .eq('id', scanId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching scan before delete:', fetchError);
    // If it's a "not found" error, that's okay - the scan doesn't exist
    if (fetchError.code === 'PGRST116') {
      return { 
        error: null,
        deleted: true // Already deleted or doesn't exist
      };
    }
    return { 
      error: { 
        message: fetchError.message || 'Scan not found or access denied',
        code: fetchError.code,
        details: fetchError
      },
      deleted: false
    };
  }
  
  if (!existingScan) {
    // Scan doesn't exist - consider it already deleted
    return { 
      error: null,
      deleted: true
    };
  }
  
  // Verify we have a valid session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('No authenticated user for delete operation:', authError);
    return { 
      error: { 
        message: 'You must be logged in to delete scans',
        code: 'UNAUTHORIZED'
      },
      deleted: false
    };
  }
  
  if (user.id !== userId) {
    console.error('User ID mismatch:', { sessionUserId: user.id, providedUserId: userId });
    return { 
      error: { 
        message: 'User ID mismatch. Cannot delete scan.',
        code: 'UNAUTHORIZED'
      },
      deleted: false
    };
  }
  
  // Perform the deletion with select to get confirmation
  const { data, error } = await supabase
    .from('scans')
    .delete()
    .eq('id', scanId)
    .eq('user_id', userId)
    .select('id'); // Return deleted row ID to verify deletion
  
  if (error) {
    console.error('Error deleting scan:', error);
    return { 
      error: { 
        message: error.message || 'Failed to delete scan',
        code: error.code,
        details: error
      },
      deleted: false
    };
  }
  
  // Verify deletion succeeded - data should contain the deleted row
  if (!data || data.length === 0) {
    console.warn('Delete operation returned no data - verifying scan still exists');
    
    // Double-check: try to fetch the scan again
    const { data: verifyScan } = await supabase
      .from('scans')
      .select('id')
      .eq('id', scanId)
      .eq('user_id', userId)
      .single();
    
    if (verifyScan) {
      // Scan still exists - deletion failed
      return { 
        error: { 
          message: 'Delete operation did not succeed. The scan still exists.',
        },
        deleted: false
      };
    } else {
      // Scan doesn't exist - deletion succeeded (even though select didn't return it)
      console.log('Scan deleted successfully (verified by absence):', scanId);
      return { error: null, deleted: true };
    }
  }
  
  console.log('Scan deleted successfully:', scanId, 'Deleted row:', data[0]);
  return { error: null, deleted: true };
}
