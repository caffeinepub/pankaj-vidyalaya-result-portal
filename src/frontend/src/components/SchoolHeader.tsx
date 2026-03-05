import { Link } from "@tanstack/react-router";

export function SchoolHeader() {
  return (
    <header className="no-print sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm shadow-xs">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-3 group"
          data-ocid="nav.link"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg navy-gradient shadow-sm group-hover:shadow-md transition-shadow overflow-hidden">
            <img
              src="/assets/generated/school-emblem-transparent.dim_120x120.png"
              alt="School Emblem"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-tight text-foreground">
              Pankaj Vidyalaya
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              Chopda
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to="/results"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-secondary"
            data-ocid="nav.results_link"
          >
            Check Result
          </Link>
          <Link
            to="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-secondary"
            data-ocid="nav.admin_link"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
