import { Logo } from '@/components/logo';
import { UploadForm } from '@/components/upload-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, GanttChartSquare, Share2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] z-0" />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10 min-h-screen">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="container max-w-4xl flex flex-col items-center text-center z-10">
          <Logo className="text-5xl" />
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl font-body tracking-wider">
            Got your game data? Upload your playthrough history from sites like HowLongToBeat and get a personalized, shareable "Gaming Wrapped" story.
          </p>

          <Card className="mt-10 w-full max-w-lg bg-card/80 backdrop-blur-sm shadow-lg shadow-primary/20 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl tracking-widest">UPLOAD YOUR DATA</CardTitle>
              <CardDescription className="font-body text-base">Drop your .csv file here to start the magic.</CardDescription>
            </CardHeader>
            <CardContent>
              <UploadForm />
            </CardContent>
          </Card>

          <div className="mt-24 w-full">
            <h2 className="text-3xl font-headline font-semibold tracking-widest">HOW IT WORKS</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <Card className="bg-card/50 backdrop-blur-sm p-6 flex flex-col items-center text-center gap-4 hover:border-accent transition-all border-transparent border-2">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mt-2 font-headline text-xl tracking-wider">1. UPLOAD</h3>
                <p className="text-base font-body text-muted-foreground">Export your gaming data and upload it. Easy peasy.</p>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm p-6 flex flex-col items-center text-center gap-4 hover:border-accent transition-all border-transparent border-2">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary">
                  <GanttChartSquare className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mt-2 font-headline text-xl tracking-wider">2. REWIND</h3>
                <p className="text-base font-body text-muted-foreground">Our AI bot analyzes your year, creating a unique story and stats.</p>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm p-6 flex flex-col items-center text-center gap-4 hover:border-accent transition-all border-transparent border-2">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary">
                  <Share2 className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mt-2 font-headline text-xl tracking-wider">3. SHARE</h3>
                <p className="text-base font-body text-muted-foreground">Get a shareable link to your personalized slideshow to show off.</p>
              </Card>
            </div>
          </div>

          <div className="mt-24 w-full text-left max-w-4xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-headline text-xl">How To Get Your Data</AccordionTrigger>
                <AccordionContent className="text-base font-body text-muted-foreground space-y-4 pt-4">
                  <p><strong className="text-primary">HowLongToBeat:</strong> Go to your profile, click 'Export Library' at the bottom of the games list, and save the CSV file.</p>
                  <p><strong className="text-primary">Steam:</strong> Unfortunately, Steam doesn't have a direct export feature. You might need to use third-party tools like <a href="https://steam.tools/games/" target="_blank" rel="noopener noreferrer" className="text-accent underline">steam.tools</a>, but use them at your own risk. Another option is manually creating a CSV with columns: Title, Platform, Review Score, Review Notes.</p>
                  <p><strong className="text-primary">PlayStation/Xbox:</strong> Console platforms do not provide an easy way to export your game library. We recommend manually creating a CSV file for the most accurate Rewind.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="font-headline text-xl">How We Use Your Data</AccordionTrigger>
                <AccordionContent className="text-base font-body text-muted-foreground space-y-4 pt-4">
                  <p>Your privacy is paramount. Here's the deal:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The CSV data you upload is sent to our server for processing and is NOT stored long-term.</li>
                    <li>We use the data *only* to generate your personalized Game Rewind. It is not used for any other purpose, sold, or shared with third parties.</li>
                    <li>The AI model that processes your data is prohibited from training on it.</li>
                    <li>Your generated Rewind is accessible via a unique, shareable link, but the underlying data is discarded after your session.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="font-headline text-xl">Terms of Service</AccordionTrigger>
                <AccordionContent className="text-base font-body text-muted-foreground space-y-4 pt-4">
                  <p>By using Game Rewind, you agree to the following terms:</p>
                   <ul className="list-disc pl-6 space-y-2">
                    <li>This service is provided "as is" for entertainment purposes. We make no guarantees about the accuracy or availability of the service.</li>
                    <li>You are responsible for the data you upload. Ensure you have the right to use and share it. Do not upload sensitive personal information.</li>
                    <li>We reserve the right to modify or discontinue the service at any time.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
    </div>
  );
}
