import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function ManualInstructions() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Manual Setup Instructions</CardTitle>
        <CardDescription>
          Follow these steps to manually set up storage buckets and RLS policies in the Supabase dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            The automatic setup may not work due to permission limitations. Please follow these manual steps instead.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">1. Create Storage Buckets</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to your{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Supabase dashboard
                </a>
              </li>
              <li>Select your project</li>
              <li>
                Navigate to <strong>Storage</strong> in the left sidebar
              </li>
              <li>
                Click <strong>New Bucket</strong>
              </li>
              <li>
                Create a bucket named <code>videos</code>
                <ul className="list-disc pl-5 mt-1">
                  <li>Uncheck &quot;Public bucket&quot; to make it private</li>
                </ul>
              </li>
              <li>
                Click <strong>New Bucket</strong> again
              </li>
              <li>
                Create a bucket named <code>thumbnails</code>
                <ul className="list-disc pl-5 mt-1">
                  <li>Check &quot;Public bucket&quot; to make it public</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">2. Set Up RLS Policies for Videos Bucket</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                In the Storage section, click on the <code>videos</code> bucket
              </li>
              <li>
                Click on the <strong>Policies</strong> tab
              </li>
              <li>
                Click <strong>Add Policies</strong> button
              </li>
              <li>
                For the first policy:
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    Select <strong>INSERT</strong> for the policy type
                  </li>
                  <li>
                    Name it <code>Allow authenticated uploads</code>
                  </li>
                  <li>
                    Set the policy definition to: <code>(auth.role() = &apos;authenticated&apos;)</code>
                  </li>
                  <li>
                    Click <strong>Save Policy</strong>
                  </li>
                </ul>
              </li>
              <li>
                Click <strong>Add Policies</strong> again
              </li>
              <li>
                For the second policy:
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    Select <strong>SELECT</strong> for the policy type
                  </li>
                  <li>
                    Name it <code>Allow owner access</code>
                  </li>
                  <li>
                    Set the policy definition to: <code>(auth.uid() = owner)</code>
                  </li>
                  <li>
                    Click <strong>Save Policy</strong>
                  </li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">3. Set Up RLS Policies for Thumbnails Bucket</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go back to Storage and click on the <code>thumbnails</code> bucket
              </li>
              <li>
                Click on the <strong>Policies</strong> tab
              </li>
              <li>
                Click <strong>Add Policies</strong> button
              </li>
              <li>
                For the first policy:
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    Select <strong>SELECT</strong> for the policy type
                  </li>
                  <li>
                    Name it <code>Allow public access</code>
                  </li>
                  <li>
                    Set the policy definition to: <code>(true)</code>
                  </li>
                  <li>
                    Click <strong>Save Policy</strong>
                  </li>
                </ul>
              </li>
              <li>
                Click <strong>Add Policies</strong> again
              </li>
              <li>
                For the second policy:
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    Select <strong>INSERT</strong> for the policy type
                  </li>
                  <li>
                    Name it <code>Allow authenticated uploads</code>
                  </li>
                  <li>
                    Set the policy definition to: <code>(auth.role() = &apos;authenticated&apos;)</code>
                  </li>
                  <li>
                    Click <strong>Save Policy</strong>
                  </li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="text-md font-semibold text-blue-800 mb-2">Alternative Policy for Videos</h3>
            <p className="text-sm text-blue-700 mb-2">
              If the owner-based policy doesn&apos;t work, you can try a simpler policy that allows authenticated users to
              access all videos:
            </p>
            <pre className="bg-white p-2 rounded text-sm overflow-x-auto">(auth.role() = &apos;authenticated&apos;)</pre>
            <p className="text-sm text-blue-700 mt-2">
              This is less secure but can help troubleshoot permission issues.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

