import { Link } from 'react-router-dom';
import { BrainCircuit, BookOpen, Clock, Target, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-32 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background flex flex-col items-center text-center overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute top-48 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>Study Smarter, Not Harder. Now powered by AI.</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            Transform Your Notes into <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              Actionable Knowledge
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your PDFs and let StudyAI instantly generate summaries, adaptive flashcards, and practice quizzes to help you ace your next exam.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-full hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/25 hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Learning for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground text-lg font-semibold rounded-full hover:bg-secondary/80 transition-all flex items-center justify-center"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-background border-t">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to master any subject.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI engine breaks down complex documents and builds a personalized curriculum tailored just for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors"></div>
              <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Summaries</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload massive PDFs and get concise, section-by-section summaries in seconds. Never read filler text again.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-colors"></div>
              <div className="bg-purple-100 text-purple-700 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Flashcards</h3>
              <p className="text-muted-foreground leading-relaxed">
                Interactive 3D flashcards automatically generated from your material, featuring spaced-repetition tracking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-colors"></div>
              <div className="bg-orange-100 text-orange-700 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Adaptive Quizzes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Test your knowledge with mixed-mode practice exams (MCQ, True/False, Short Answer) graded instantly by AI.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-colors"></div>
              <div className="bg-green-100 text-green-700 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Study Planner</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI analyzes your weak topics and generates a 7-day study schedule to ensure you are ready for exam day.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof / How it works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Go from zero to <span className="text-primary">Mastery</span> in three simple steps.</h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="mt-1 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Upload Material</h4>
                    <p className="text-muted-foreground">Drop your syllabus, lecture notes, or textbooks (PDF, DOCX) into the dashboard.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">AI Processing</h4>
                    <p className="text-muted-foreground">Our intelligent engine reads the document, extracts key concepts, and builds a curriculum.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Start Learning</h4>
                    <p className="text-muted-foreground">Review the summary, flip through flashcards, take practice tests, and track your analytics.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-card border rounded-2xl p-8 shadow-xl relative">
              <div className="absolute -left-6 -top-6 bg-green-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg transform -rotate-6">
                +42% Higher Test Scores
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                
                <div className="flex gap-2 pt-6">
                  <div className="w-1/2 h-24 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center flex-col text-primary">
                    <CheckCircle2 className="h-6 w-6 mb-2" />
                    <span className="font-bold">Passed</span>
                  </div>
                  <div className="w-1/2 h-24 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground">
                    Next Topic
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-5 w-5" />
            <span className="font-semibold text-foreground">StudyAI</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Contact Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
