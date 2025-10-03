import { useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { MenuIcon, Moon, Sun, XIcon } from "lucide-react";
import ButtonIcon from "./ButtonIcon";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getDefaultSearchParamsString } from "@/data/Search";

const defaultSearchString = getDefaultSearchParamsString();

const paths = [
  { label: "Home", href: "/" },
  { label: "Tasks", href: "/tasks?" + defaultSearchString },
  { label: "Statuses", href: "/statuses?" + defaultSearchString },
  { label: "Categories", href: "/categories?" + defaultSearchString },
  { label: "Kanban", href: "/kanban" },
];

export function NavigationHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setTheme } = useTheme();
  
  return (
    <header className="shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Breadcrumbs />
          </div>

          <NavigationMenu className="hidden md:block">
            <NavigationMenuList className="flex items-center justify-between h-16">
              {paths.slice(1).map((path) => (
                <NavigationMenuItem key={path.href}>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link
                      href={path.href}
                      className="text-xl font-bold"
                      children={path.label}
                    />
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ButtonIcon
              className="md:hidden w-8 h-8"
              props={{
                onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen),
              }}
            >
              {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </ButtonIcon>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t pt-4">
            <nav className="space-y-2">
              {paths.slice(1).map((path) => (
                <Link
                  key={path.href + "__mobile"}
                  href={path.href}
                  className="block px-3 py-2 rounded-md text-sm font-medium"
                  children={path.label}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
